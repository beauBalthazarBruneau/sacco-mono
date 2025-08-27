# demand.py
import numpy as np
from typing import Dict, List, Iterable, Tuple
from collections import defaultdict
from scipy.stats import t
import numpy as np
from typing import Dict, Iterable, Optional
from scipy.stats import t as student_t

# ========== Core helpers ==========

def _ensure_espn_rank(df):
    """Use df['espn_rank'] if present; else fall back to df['global_rank']."""
    if 'espn_rank' in df.columns and df['espn_rank'].notna().any():
        return 'espn_rank'
    return 'global_rank'  # created in util.load_players()

def _normalize(d: Dict[int, float]) -> Dict[int, float]:
    s = float(sum(v for v in d.values() if v > 0))
    if s <= 0:
        return {k: 0.0 for k in d}
    return {k: (v / s if v > 0 else 0.0) for k, v in d.items()}

# ========== Player-level ESPN hazards ==========
def multi_pick_player_hazards(df, draft, available_ix, horizon, n_samples=100):
    """
    Generate realistic multi-pick hazards by sampling actual pick sequences.
    
    Args:
        n_samples: Number of Monte Carlo samples to generate
    """
    all_hazards = []
    
    for _ in range(n_samples):
        # Start with fresh available players for each sample
        left = available_ix.copy()
        sample_hazards = []
        
        for step in range(horizon):
            owner = draft.pick_owner(draft.current_pick + step)
            team = draft.teams[owner]
            
            # Calculate hazard for current available pool
            probs = next_pick_probs_mix(
                df, left, draft.current_pick + step, team
            )

            if not probs:
                sample_hazards.append({})
                continue
                
            # Sample a player to be picked (this removes them from future pools)
            picked_player = np.random.choice(
                list(probs.keys()), 
                p=list(probs.values())
            )
            
            # Remove picked player from available pool
            left = [ix for ix in left if ix != picked_player]
            
            sample_hazards.append(probs)
        
        all_hazards.append(sample_hazards)
    
    # Aggregate across samples to get expected hazards
    aggregated_hazards = []
    for step in range(horizon):
        step_probs = defaultdict(float)
        total_weight = 0
        
        for sample in all_hazards:
            if step < len(sample) and sample[step]:
                weight = 1.0  # Could weight by sample probability if needed
                for player, prob in sample[step].items():
                    step_probs[player] += prob * weight
                total_weight += weight
        
        # Normalize
        if total_weight > 0:
            step_probs = {k: v/total_weight for k, v in step_probs.items()}
        
        aggregated_hazards.append(dict(step_probs))
    
    return aggregated_hazards

# ========== Byproduct: positional drains from player-level hazards ==========

def expected_position_drain_from_hazards(hazards: List[Dict[int, float]], df) -> Dict[str, float]:
    """
    Sum probability mass by position across the upcoming picks.
    Returns: E[K_pos] for each position.
    """
    E = defaultdict(float)
    for pick_probs in hazards:
        for ix, p in pick_probs.items():
            pos = df.loc[ix, 'position']
            E[pos] += p
    return dict(E)

# ========== Player survival probabilities ==========

def survival_probs(hazards, player_ixs):
    """
    hazards[t][i] should be the *unconditional* probability player i is picked at step t.
    Survival to your next pick = 1 - sum_t P(picked at t).
    """
    surv = {}
    for ix in player_ixs:
        picked_mass = sum(pick_probs.get(ix, 0.0) for pick_probs in hazards)
        s = 1.0 - picked_mass
        surv[ix] = max(0.0, min(1.0, s))  # clip for numeric drift
    return surv

# ========== Convenience: one-shot forecast package ==========

def forecast_until_next_pick_esbn(df, draft, available_ix: Iterable[int], horizon: int):
    """
    Bundle: hazards list + positional drains E[K_pos].
    """
    hazards = multi_pick_player_hazards(df, draft, available_ix, horizon)
    E_drain = expected_position_drain_from_hazards(hazards, df)
    return hazards, E_drain


def _tier_gaps_by_rank(df, rank_col, gap_col='proj_pts', min_gap=0.0):
    """
    Returns a dict player_ix -> positive gap above them (difference to previous in sorted list).
    If gap_col not present, falls back to rank spacing (inverse gaps).
    """
    ix_sorted = df.sort_values(rank_col).index.to_list()
    gaps = {}
    if gap_col in df.columns:
        vals = df.loc[ix_sorted, gap_col].values
        for k, ix in enumerate(ix_sorted):
            if k == 0:
                gaps[ix] = 0.0
            else:
                gaps[ix] = max(vals[k-1] - vals[k], 0.0)
    else:
        # use rank differences as a weak proxy (mostly zeros because ranks are contiguous)
        for k, ix in enumerate(ix_sorted):
            gaps[ix] = 0.0 if k == 0 else 0.0
    # prune tiny gaps
    for ix in gaps:
        if gaps[ix] < min_gap:
            gaps[ix] = 0.0
    return gaps

def next_pick_probs_mix(
    df,
    available_ix: Iterable[int],
    pick_num: int,
    team=None,                            # optional: apply roster constraints
    base_weight: Optional[Dict[int,float]] = None,
    # windows & schedules
    window_min: int = 3,
    window_max: int = 36,
    growth_every_picks: int = 6,          # expand window as draft advances
    # ADP hazard params (Student-t for fat tails)
    dfree: int = 4,
    sigma_by_pos: Dict[str, float] = {'RB': 5.0, 'WR': 5.0, 'TE': 12.0, 'QB': 15.0},
    sigma_growth_per_pick: float = 0.20,  # widen later in draft
    # priors & boosts
    beta_rank: float = 1.2,               # rank-power exponent (bigger => sharper top)
    tier_boost: float = 0.08,             # scales gap effect
    min_gap_pts: float = 0.8,             # only boost tiers with >= this projected-pts gap
    # final sharpening
    gamma_at_start: float = 1.6,          # >1 sharpens; will decay over draft
    gamma_decay_per_pick: float = 0.01,
):
    rank_col = 'espn_rank' if ('espn_rank' in df.columns and df['espn_rank'].notna().any()) else 'global_rank'
    avail_df = df.loc[list(available_ix)]

    # ---- dynamic window (tight early, looser later) ----
    w = min(window_max, window_min + (max(pick_num-1, 0) // growth_every_picks))
    topN = avail_df.nsmallest(w, rank_col)

    # ---- precompute tier gaps (optional proj-based) ----
    gaps = _tier_gaps_by_rank(df, rank_col, gap_col='proj_pts', min_gap=min_gap_pts)

    # ---- components: ADP hazard, rank prior, tier boost ----
    adp = topN['adp'].to_dict()
    pos = topN['position'].to_dict()
    ranks = topN[rank_col].to_dict()

    need_mult = _pos_need_multipliers(team) if team is not None else None

    scores = {}
    for pid in topN.index:
        # ADP hazard (fatter tails + narrower early)
        s0 = sigma_by_pos.get(pos[pid], 8.0)
        s = max(1.0, s0 + sigma_growth_per_pick * max(pick_num-1, 0))  # widen as draft advances
        z = (pick_num - adp[pid]) / s
        f = student_t.pdf(z, df=dfree) / s  # scale-aware pdf
        F_prev = student_t.cdf((pick_num-1 - adp[pid]) / s, df=dfree)
        S_prev = max(1e-6, 1.0 - F_prev)
        hazard = f / S_prev

        # rank power prior
        rank_prior = (1.0 / max(1.0, float(ranks[pid]))) ** beta_rank

        # tier gap bump
        gap = float(gaps.get(pid, 0.0))
        boost = (1.0 + tier_boost * gap)

        w_base = 1.0 if base_weight is None else float(base_weight.get(pid, 1.0))


        pos_pid = pos[pid]
        m_need = 1.0
        if need_mult is not None:
            m_need = need_mult.get(pos_pid, 1.0)

        scores[pid] = hazard * rank_prior * boost * w_base * m_need

    # roster constraint (optional)
    if team is not None:
        for pid in list(scores.keys()):
            if not team.can_draft(df.loc[pid, 'position']):
                scores[pid] = 0.0

    # normalize -> sharpen -> renormalize
    vals = np.array(list(scores.values()), dtype=float)
    if vals.sum() <= 0:
        # fallback uniform over legal topN
        k = len(scores)
        return {pid: 1.0/k for pid in scores} if k else {}

    probs = vals / vals.sum()

    # round-dependent sharpening (gamma ↓ over time)
    gamma = max(1.0, gamma_at_start - gamma_decay_per_pick * max(pick_num-1, 0))
    probs = probs**gamma
    probs = probs / probs.sum()

    return {pid: float(p) for pid, p in zip(scores.keys(), probs)}


def _pos_need_multipliers(
    team,
    flex_share: Dict[str, float] = {'RB': 0.55, 'WR': 0.40, 'TE': 0.05, 'QB': 0.0},
    k: float = 0.35,
    cap: float = 3.0,
    urgency: float = 0.15  # mild boost later in draft if a slot is still open
) -> Dict[str, float]:
    """
    Convert the team's remaining slots into per-position multipliers.
    team.need[...] should be remaining starting slots (and FLEX).
    """
    need = getattr(team, "need", {}) or {}
    flex_left = float(need.get('FLEX', 0))
    out = {}
    for p in ['QB','RB','WR','TE']:
        eff = float(need.get(p, 0)) + flex_share.get(p, 0.0) * flex_left
        base = np.exp(k * eff)
        # small urgency factor if there's still need at this position
        urg = 1.0 + urgency * (eff / (1.0 + eff)) if eff > 0 else 1.0
        out[p] = min(cap, base * urg)
    return out
