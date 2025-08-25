# demand.py
import numpy as np
from typing import Dict, List, Iterable, Tuple
from collections import defaultdict

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

def esbn_pick_probs_for_team(
    df,
    available_ix: Iterable[int],
    team,
    N: int = 10,               # main ESPN top-N attention window
    eta: float = 0.4,          # sharpness for top-N
    tail_k: int = 5,           # how many "just off screen" players to consider
    tail_w: float = 0.10,      # % of attention mass reserved for the tail
    eta_tail: float = 0.10     # gentler decay for tail
) -> Dict[int, float]:
    """
    Player-level hazard for ONE upcoming pick:
      - Take top-N remaining by ESPN default rank (or global_rank fallback)
      - Softmax over (-eta * rank) for the main window
      - Add a small "leaky tail" (tail_k) just beyond N with mass tail_w
      - Zero out players the team cannot draft; renormalize
    """
    rank_col = _ensure_espn_rank(df)
    avail = df.loc[list(available_ix)]

    # progressively widen the main window if necessary
    for window in (N, max(N, 15), max(N, 25), len(avail)):
        topN = avail.nsmallest(window, rank_col)

        # --- main window softmax (top-N) ---
        top_scores = -eta * topN[rank_col].values
        top_scores -= top_scores.max()  # numerical stability
        top_weights = np.exp(top_scores)
        probs_top = dict(zip(topN.index.to_list(), (top_weights / top_weights.sum()).tolist()))

        # --- leaky tail just outside top-N ---
        tail_pool = avail.loc[~avail.index.isin(topN.index)].nsmallest(tail_k, rank_col)
        if len(tail_pool) > 0 and tail_w > 0:
            tail_scores = -eta_tail * tail_pool[rank_col].values
            tail_scores -= tail_scores.max()
            tail_weights = np.exp(tail_scores)
            tail_weights = tail_weights / tail_weights.sum()

            # scale masses: (1 - tail_w) for top, tail_w for tail
            probs_top = {ix: (1.0 - tail_w) * w for ix, w in probs_top.items()}
            probs_tail = dict(zip(tail_pool.index.to_list(), (tail_w * tail_weights).tolist()))
            probs = {**probs_top, **probs_tail}
        else:
            probs = probs_top

        # --- roster need filter, then renormalize ---
        any_allowed = False
        for ix in list(probs.keys()):
            pos = df.loc[ix, 'position']
            if not team.can_draft(pos):
                probs[ix] = 0.0
            else:
                any_allowed = True

        if any_allowed and sum(probs.values()) > 0:
            return _normalize(probs)

    # Final fallback: best-ranked legal
    for ix in avail.sort_values(rank_col).index:
        if team.can_draft(df.loc[ix, 'position']):
            return {ix: 1.0}
    return {}


def multi_pick_player_hazards(df, draft, available_ix, horizon, N=10, eta=0.4):
    hazards = []
    for step in range(horizon):
        owner = draft.pick_owner(draft.current_pick + step)
        team = draft.teams[owner]
        # grow the visible window a bit the farther out we are
        N_step = N + max(0, step // 6)  # +1 every ~6 picks
        probs = esbn_pick_probs_for_team(df, available_ix, team, N=N_step, eta=eta)
        hazards.append(probs)
    return hazards


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

def survival_probs(hazards: List[Dict[int, float]], player_ixs: Iterable[int]) -> Dict[int, float]:
    """
    Survival to your next pick: Π_i (1 - hazard_i[p]).
    If a player doesn't appear in a pick's dict, treat hazard = 0.
    """
    surv = {ix: 1.0 for ix in player_ixs}
    for pick_probs in hazards:
        for ix in surv.keys():
            surv[ix] *= (1.0 - pick_probs.get(ix, 0.0))
    return surv

# ========== Convenience: one-shot forecast package ==========

def forecast_until_next_pick_esbn(df, draft, available_ix: Iterable[int], horizon: int, N: int = 10, eta: float = 0.4):
    """
    Bundle: hazards list + positional drains E[K_pos].
    """
    hazards = multi_pick_player_hazards(df, draft, available_ix, horizon, N=N, eta=eta)
    E_drain = expected_position_drain_from_hazards(hazards, df)
    return hazards, E_drain

# ========== Optional: autopick using ESPN hazards ==========

def autopick_index_from_hazard(hazard_for_current_pick: Dict[int, float], df, team) -> int:
    """
    Choose the argmax player index among legal picks for the current owner.
    If the hazard is empty or all illegal, fall back to best-ranked legal.
    """
    if hazard_for_current_pick:
        # Keep only legal
        legal = [(ix, p) for ix, p in hazard_for_current_pick.items() if team.can_draft(df.loc[ix,'position'])]
        if legal:
            return max(legal, key=lambda kv: kv[1])[0]
    # Fallback: best ranked legal
    rank_col = _ensure_espn_rank(df)
    for ix in df.sort_values(rank_col).index:
        if ix in hazard_for_current_pick:  # keep pool tight if possible
            if team.can_draft(df.loc[ix,'position']):
                return ix
    # As last resort scan all
    for ix in df.sort_values(rank_col).index:
        if team.can_draft(df.loc[ix,'position']):
            return ix
    raise RuntimeError("No legal pick available (roster config error?)")
