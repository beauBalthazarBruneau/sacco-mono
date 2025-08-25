# var.py
import math

# var.py (append or replace the existing DAVAR with this survival-aware one)
import math

def current_best_now(df, pos_lists, available_ix):
    out = {}
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

# var.py (replace the previous davar_esbn with this VAR-based one)

def davar_esbn(df, candidate_ix: int,
               best_now_by_pos: dict,
               E_best_next_by_pos: dict,
               replacement_ppg_by_pos: dict,
               survival_for_candidate: float,
               alpha: float = 0.9,
               beta: float = 0.8,
               risk_penalty: float = 0.0) -> float:
    """
    VAR-based, survival-aware DAVAR:
      base = VAR_now = PPG(p) - replacement_ppg[pos]
      delta_pos = (1-s) * max(0, PPG(p) - E_best_next[pos])  # cost of waiting at candidate's pos
      hedge_loss = max_over_other_pos max(0, (best_now[pos'] - E_best_next[pos']))  # cross-pos cliff
      score = base + alpha*delta_pos - beta*hedge_loss - risk_penalty
    """
    ppg = float(df.loc[candidate_ix, 'ppg'])
    pos = df.loc[candidate_ix, 'position']
    s   = float(survival_for_candidate)

    # VAR baseline
    base = ppg - float(replacement_ppg_by_pos.get(pos, 0.0))

    # cost of waiting at candidate's position
    drop_vs_next = max(0.0, ppg - E_best_next_by_pos.get(pos, 0.0))
    delta_pos = (1.0 - s) * drop_vs_next

    # cross-pos hedge (loss if you skip another pos now)
    hedge_candidates = []
    for k in best_now_by_pos.keys():
        if k == pos: 
            continue
        loss_k = max(0.0, best_now_by_pos[k] - E_best_next_by_pos.get(k, 0.0))
        hedge_candidates.append(loss_k)
    hedge_loss = max(hedge_candidates) if hedge_candidates else 0.0

    return base + alpha * delta_pos - beta * hedge_loss - risk_penalty


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


