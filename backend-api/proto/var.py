# var.py
import math
from models import FLEX_SET
from typing import Dict

def current_best_now(df, pos_lists, available_ix):
    out = {}
    player_ix_map = {}
    avail = set(available_ix)
    for pos, lst in pos_lists.items():
        ix = next((i for i in lst if i in avail), None)
        out[pos] = float(df.loc[ix,'ppg']) if ix is not None else 0.0
    return out

def expected_best_next(df, pos_lists, available_ix, E_drain, floor_ppg=7.0):
    out = {}
    avail_set = set(available_ix)
    for pos, lst in pos_lists.items():
        # find current best
        cur_best_ix = next((ix for ix in lst if ix in avail_set), None)
        if cur_best_ix is None:
            out[pos] = floor_ppg
            continue
        shift = int(math.floor(E_drain.get(pos, 0.0)))
        # advance 'shift' legal players down the list
        k = 0
        candidate_ix = cur_best_ix
        for ix in lst:
            if ix in avail_set:
                if k == shift:
                    candidate_ix = ix
                    break
                k += 1
        out[pos] = float(df.loc[candidate_ix, 'ppg']) if candidate_ix is not None else floor_ppg
    return out

def davar_esbn_deficit_weighted(
    df, candidate_ix: int,
    best_now_by_pos: Dict[str, float],
    E_best_next_by_pos: Dict[str, float],
    replacement_ppg_by_pos: Dict[str, float],
    surv_best_by_pos: Dict[str, float],
    survival_for_candidate: float,
    accrued_var_by_pos: Dict[str, float],       # A_q
    remain_var_budget_by_pos: Dict[str, float], # R_q
    alpha: float = 0.9,
    beta: float = 0.7,
    eps: float = 1e-9,
    cap_left_by_pos: Dict[str, float] | None = None,   # e.g., need[pos] + need['FLEX']/3 for RB/WR/TE
    owned_count_by_pos: Dict[str, int] | None = None,  # how many players you already own at each pos
    flex_share: float = 1/3,                           # share of FLEX per RB/WR/TE
    rho_overfill: float = 0.75,                        # strength of overfill damping
    phi_deficit: float = 1.25                          # >1 increases focus on truly needy spots
) -> float:
    """
    base   = (PPG - replacement[pos])
    wait   = alpha_pos * (1 - s) * max(0, PPG - E_best_next[pos])
             where alpha_pos = alpha * starter_use_factor / (1 + rho_overfill * overfill_pos)

    deficit weights (not normalized):
      w_q_raw = (R_q / (A_q + eps)) ** phi_deficit
      hedge   = scale * Σ_{q≠pos} w_q_raw * (1 - s_best[q]) * loss_q
      scale   = (#q) / max(eps, Σ w_q_raw)   # keeps magnitude stable but still allows w>1 when one pos dominates
    """
    ppg = float(df.loc[candidate_ix, 'ppg'])
    ppg *= (1.0 - df.loc[candidate_ix, 'exp_games_missed']/17.0)
    pos = df.loc[candidate_ix, 'position']
    s   = float(survival_for_candidate)

    # ---------- base VAR ----------
    base = ppg - float(replacement_ppg_by_pos.get(pos, 0.0))

    # ---------- same-pos wait cost with starter awareness ----------
    drop_vs_next = max(0.0, ppg - E_best_next_by_pos.get(pos, 0.0))

    # starter capacity remaining for this pos (incl a fair share of FLEX)
    starter_use_factor = 1.0
    overfill = 0.0
    if cap_left_by_pos is not None or owned_count_by_pos is not None:
        cap_left = float((cap_left_by_pos or {}).get(pos, 0.0))
        # if no starter capacity remains, the incremental value is bench-oriented → downweight the wait term
        starter_use_factor = 1.0 if cap_left > 0.0 else 0.0

        if owned_count_by_pos is not None:
            # Effective total starter capacity at this pos (static; based on starting slots + FLEX share)
            # This is a simple constant cap that doesn't depend on "need now", so it measures true stacking.
            base_cap = 0.0
            # If you keep LINEUP globally, you can pass an explicit cap_by_pos dict instead.
            # As a generic fallback, assume at least 1 starter slot exists per pos:
            base_cap = 1.0
            if pos in FLEX_SET:
                base_cap += flex_share  # rough share of FLEX capacity

            owned_here = float(owned_count_by_pos.get(pos, 0))
            overfill = max(0.0, owned_here - base_cap)

    base *= 1.0 / (1.0 + rho_overfill * overfill)

    alpha_pos = alpha * starter_use_factor / (1.0 + rho_overfill * overfill)
    wait_cost = alpha_pos * (1.0 - s) * drop_vs_next

    # ---------- deficit-weighted hedge (absolute need; >1 allowed) ----------
    w_raw = {}
    for q in best_now_by_pos.keys():
        if q == pos:
            continue
        Aq = float(accrued_var_by_pos.get(q, 0.0))
        Rq = float(remain_var_budget_by_pos.get(q, 0.0))
        w_raw[q] = (Rq / (Aq + eps)) ** phi_deficit

    sum_w = sum(w_raw.values())
    n_terms = max(1, len(w_raw))
    scale = (n_terms / max(sum_w, eps)) if sum_w > 0.0 else 0.0

    hedge = 0.0
    if sum_w > 0.0:
        for q, w in w_raw.items():
            loss_q = max(0.0, best_now_by_pos[q] - E_best_next_by_pos.get(q, 0.0))
            s_best_q = float(surv_best_by_pos.get(q, 1.0))
            hedge += (scale * w) * (1.0 - s_best_q) * loss_q

    return base + wait_cost - beta * hedge

def league_replacement_indices(n_teams: int, lineup: dict) -> dict:
    """
    Approx league-wide replacement ranks (starters across league + share of FLEX).
    For 12 teams, LINEUP={QB:1,RB:2,WR:2,TE:1,FLEX:1} → RB/WR ~ 28, TE ~ 16, QB ~ 12.
    """
    flex = int(lineup.get('FLEX', 0))
    flex_share = flex / 3.0  # split FLEX evenly among RB/WR/TE
    return {
        'QB': int(n_teams * lineup.get('QB', 1)),
        'RB': int(n_teams * lineup.get('RB', 2) + round(n_teams * flex_share)),
        'WR': int(n_teams * lineup.get('WR', 2) + round(n_teams * flex_share)),
        'TE': int(n_teams * lineup.get('TE', 1) + round(n_teams * flex_share)),
    }

def replacement_ppg_by_pos(df, pos_lists, available_ix, repl_idx_map, floor_ppg=6.0):
    """
    Return {pos: replacement_ppg_now} using the replacement rank map (1-based).
    Chooses the k-th best available at that position; clamps if fewer remain.
    """
    repl = {}
    avail_set = set(available_ix)
    for pos, lst in pos_lists.items():
        k = max(1, repl_idx_map.get(pos, 1))  # 1-based
        rank = 0
        target_ix = None
        for ix in lst:
            if ix in avail_set:
                rank += 1
                if rank == k:
                    target_ix = ix
                    break
        # clamp to worst available if list shorter than k
        if target_ix is None:
            # pick last available at this pos if any
            last_ix = None
            for ix in reversed(lst):
                if ix in avail_set:
                    last_ix = ix
                    break
            repl[pos] = float(df.loc[last_ix, 'ppg']) if last_ix is not None else floor_ppg
        else:
            repl[pos] = float(df.loc[target_ix, 'ppg'])
    return repl

def best_ix_by_pos_now(pos_lists, available_ix):
    avail = set(available_ix)
    out = {}
    for p, lst in pos_lists.items():
        out[p] = next((ix for ix in lst if ix in avail), None)
    return out

def remaining_var_budget_by_pos(
    df, pos_lists, available_ix, team, lineup, replacement_ppg_by_pos,
    bench_left: int = 0, bench_weight: float = 1.0
):
    """
    Returns {pos: R_p}, the max VAR you can still add if you:
      1) Fill remaining starters at each position from the current board.
      2) Fill remaining FLEX greedily from RB/WR/TE leftovers.
      3) Fill 'bench_left' BENCH slots greedily from ALL leftovers (QB/RB/WR/TE).
         (Bench VAR is attributed back to the player's base position; optionally
          discount with bench_weight in [0,1].)

    Note: This uses pure surplus vs league replacement at each player's position.
    """
    avail = set(available_ix)
    need = getattr(team, "need", {}) or {}

    starters_left = {p: max(0, int(need.get(p, 0))) for p in ['QB','RB','WR','TE']}
    flex_left = max(0, int(need.get('FLEX', 0)))

    # Build per-position surplus ladders (descending) from the board
    ladders = {}
    for p in ['QB','RB','WR','TE']:
        repl = float(replacement_ppg_by_pos.get(p, 0.0))
        vals = []
        for ix in pos_lists.get(p, []):
            if ix in avail:
                var = float(df.loc[ix, 'ppg']) - repl
                if var > 0:
                    vals.append(var)
        vals.sort(reverse=True)
        ladders[p] = vals

    R = {p: 0.0 for p in ['QB','RB','WR','TE']}

    # (1) Fill remaining starters at each position
    leftovers = []  # [(pos, var), ...] not taken as starters
    for p in ['QB','RB','WR','TE']:
        k = starters_left[p]
        take = min(k, len(ladders[p]))
        if take > 0:
            R[p] += sum(ladders[p][:take])
        leftovers.extend([(p, v) for v in ladders[p][take:]])

    # (2) Fill remaining FLEX from RB/WR/TE leftovers
    if flex_left > 0:
        flex_pool = [(p, v) for (p, v) in leftovers if p in ('RB','WR','TE')]
        flex_pool.sort(key=lambda x: x[1], reverse=True)
        take_flex = min(flex_left, len(flex_pool))
        for i in range(take_flex):
            p, v = flex_pool[i]
            R[p] += v
        # Remove used FLEX items from leftovers
        used_set = set(id(x) for x in flex_pool[:take_flex])
        leftovers = [x for x in leftovers if id(x) not in used_set]

    # (3) Fill BENCH slots from ALL leftovers (QB included), attribute to base pos
    if bench_left > 0 and leftovers:
        leftovers.sort(key=lambda x: x[1], reverse=True)
        take_bench = min(bench_left, len(leftovers))
        for i in range(take_bench):
            p, v = leftovers[i]
            R[p] += bench_weight * v

    return R

def accrued_var_by_pos(df, team, lineup, replacement_ppg_by_pos):
    """
    Returns {pos: accrued_VAR} from the team's current *starting* lineup:
    - Take best 'lineup[pos]' players at pos by surplus (ppg - repl[pos])
    - Fill current FLEX slots from remaining RB/WR/TE by surplus
    - Accrue FLEX VAR back to each player's base position
    """
    picks = list(getattr(team, "picks", []))
    by_pos = {'QB': [], 'RB': [], 'WR': [], 'TE': []}
    for ix in picks:
        p = df.loc[ix, 'position']
        if p in by_pos:
            var = float(df.loc[ix, 'ppg']) - float(replacement_ppg_by_pos.get(p, 0.0))
            by_pos[p].append(max(0.0, var))

    for p in by_pos:
        by_pos[p].sort(reverse=True)

    # starters filled so far = lineup[pos] - need[pos] (clamped)
    need = getattr(team, "need", {}) or {}
    filled_now = {p: max(0, int(lineup.get(p, 0)) - int(need.get(p, 0))) for p in ['QB','RB','WR','TE']}
    flex_filled_now = max(0, int(lineup.get('FLEX', 0)) - int(need.get('FLEX', 0)))

    accrued = {p: 0.0 for p in ['QB','RB','WR','TE']}
    leftovers = []

    # accrue starters by position
    for p in ['QB','RB','WR','TE']:
        take = min(filled_now.get(p, 0), len(by_pos[p]))
        accrued[p] += sum(by_pos[p][:take])
        leftovers.extend([(p, v) for v in by_pos[p][take:]])

    # FLEX: from leftovers among RB/WR/TE
    leftovers = [(p, v) for (p, v) in leftovers if p in ('RB','WR','TE') and v > 0]
    leftovers.sort(key=lambda x: x[1], reverse=True)
    for (p, v) in leftovers[:flex_filled_now]:
        accrued[p] += v

    return accrued

