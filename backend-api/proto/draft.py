# draft.py
import sys, readline
import pandas as pd
from tabulate import tabulate
from util import load_players, positional_lists, load_espn_ranks, attach_espn_ranks_inplace, report_espn_match_coverage
from models import DraftState, LINEUP


from demand import (
    forecast_until_next_pick_esbn,
    survival_probs,
    autopick_index_from_hazard,
    esbn_pick_probs_for_team  # add to your imports
)
from var import expected_best_next, current_best_now, davar_esbn, league_replacement_indices, replacement_ppg_by_pos
from util import positional_lists

from collections import defaultdict # ensure this import exists

def _espn_rank_col(df):
    # prefer ESPN rank; fall back to any global rank you keep
    return 'espn_rank' if 'espn_rank' in df.columns else 'global_rank'

def current_espn_board_positions(df, available_ix):
    """
    Return {player_ix: 1-based ordinal} on the CURRENT ESPN board,
    i.e., sort remaining players by ESPN rank and number them 1..K.
    Example: if a player was #5 pre-draft and top 4 are gone -> they are #1.
    """
    col = _espn_rank_col(df)
    avail = df.loc[list(available_ix)].sort_values(col)
    return {ix: i+1 for i, ix in enumerate(avail.index)}


def available_indices(df, taken):
    return [i for i in df.index if i not in taken]

def predict_current_pick(df, draft, N_window=10, eta=0.4):
    """
    Predict the player the CURRENT team (draft.current_pick owner) will take,
    using the ESPN hazard for THIS pick only.
    Returns: (pred_ix, hazard_current_dict)
    """
    owner = draft.pick_owner(draft.current_pick)
    team = draft.teams[owner]
    avail_ix = available_indices(df, draft.taken)
    hazard = esbn_pick_probs_for_team(df, avail_ix, team, N=N_window, eta=eta)
    if not hazard:
        return None, {}
    pred_ix = max(hazard.items(), key=lambda kv: kv[1])[0]
    return pred_ix, hazard



def _assign_user_lineup(df, team):
    """
    Greedy, best-ball style assignment for DISPLAY ONLY:
    - Fill starters at QB/RB/WR/TE by highest PPG.
    - Fill FLEX from remaining RB/WR/TE by highest PPG.
    - Remaining players shown as BENCH (sorted by PPG).
    """
    by_pos = defaultdict(list)
    for ix in team.picks:
        pos = df.loc[ix, 'position']
        by_pos[pos].append(ix)
    for pos in by_pos:
        by_pos[pos].sort(key=lambda i: float(df.loc[i, 'ppg']), reverse=True)

    rows, assigned = [], set()

    # Starters
    for pos in ['QB', 'RB', 'WR', 'TE']:
        filled = LINEUP.get(pos, 0) - team.need.get(pos, 0)  # slots actually filled so far
        # take top 'filled' players at this pos as starters
        for i, ix in enumerate(by_pos.get(pos, [])[:max(filled, 0)]):
            assigned.add(ix)
            rows.append([f"{pos}{i+1}", df.loc[ix, 'player_name'], pos, round(float(df.loc[ix, 'ppg']), 2)])

    # FLEX (from extras across RB/WR/TE)
    flex_filled = LINEUP.get('FLEX', 0) - team.need.get('FLEX', 0)
    flex_pool = []
    for pos in ['RB', 'WR', 'TE']:
        starters = LINEUP.get(pos, 0)
        extras = by_pos.get(pos, [])[starters:]  # players beyond starter count
        flex_pool.extend(extras)
    flex_pool.sort(key=lambda i: float(df.loc[i, 'ppg']), reverse=True)
    for i, ix in enumerate(flex_pool[:max(flex_filled, 0)]):
        assigned.add(ix)
        rows.append([f"FLEX{i+1}", df.loc[ix, 'player_name'], df.loc[ix, 'position'], round(float(df.loc[ix, 'ppg']), 2)])

    # Bench (anything not assigned above)
    bench = []
    for pos, lst in by_pos.items():
        for ix in lst:
            if ix not in assigned:
                bench.append(ix)
    bench.sort(key=lambda i: float(df.loc[i, 'ppg']), reverse=True)
    for ix in bench:
        rows.append(["BENCH", df.loc[ix, 'player_name'], df.loc[ix, 'position'], round(float(df.loc[ix, 'ppg']), 2)])

    return rows

def print_user_roster(df, draft):
    team = draft.teams[draft.user_team_ix]
    rows = _assign_user_lineup(df, team)
    counts = []
    for pos in ['QB', 'RB', 'WR', 'TE', 'FLEX']:
        filled = LINEUP.get(pos, 0) - team.need.get(pos, 0)
        remaining = team.need.get(pos, 0)
        counts.append([pos, max(filled, 0), max(remaining, 0)])

    print("\n-- Your roster so far --")
    if rows:
        print(tabulate(rows, headers=["Slot", "Player", "Pos", "PPG"], tablefmt="github"))
    else:
        print("(no picks yet)")
    print(tabulate(counts, headers=["Slot", "Filled", "Remaining"], tablefmt="github"))



def available_indices(df, taken):
    return [i for i in df.index if i not in taken]

def steps_until_user_next_pick(draft):
    cur = draft.current_pick
    total = draft.n_teams * draft.rounds
    steps = 0
    # if it's your pick right now, look AFTER you pick
    if draft.pick_owner(cur) == draft.user_team_ix:
        cur += 1  # skip your current pick (e.g., at 24, next is 25)
    # include the current non-user pick in the count
    while (cur + steps) <= total and draft.pick_owner(cur + steps) != draft.user_team_ix:
        steps += 1
    return steps

def show_recs(df, draft, topN=12, N_window=10, eta=0.4, alpha=0.9, beta=0.6):
    # horizon until user's next pick
    h = steps_until_user_next_pick(draft)
    avail_ix = available_indices(df, draft.taken)
    pos_lists = positional_lists(df)


    # ESPN-based hazards & drains
    hazards, E_drain = forecast_until_next_pick_esbn(df, draft, avail_ix, h, N=N_window, eta=eta)

    print(f"Horizon to your next pick (H) = {h}, sum(E[K_pos]) = {round(sum(E_drain.values()),2)}")
    
    board_pos_map = current_espn_board_positions(df, avail_ix)

    
    # Survival for candidate set (take top ~60 by PPG among available)
    cand_df = df.loc[avail_ix].sort_values('ppg', ascending=False).head(60)
    surv = survival_probs(hazards, cand_df.index)

    # Best-now and expected-best-next by position
    best_now = current_best_now(df, pos_lists, avail_ix)
    E_best_next = expected_best_next(df, pos_lists, avail_ix, E_drain)

    # Replacement indices
    repl_idx_map = league_replacement_indices(draft.n_teams, LINEUP)
    repl_ppg = replacement_ppg_by_pos(df, pos_lists, avail_ix, repl_idx_map)

    # Build table
    rows = []
    for ix, r in cand_df.iterrows():
        score = davar_esbn(
            df, ix, best_now, E_best_next,
            repl_ppg,
            survival_for_candidate=surv.get(ix, 1.0),
            alpha=alpha, beta=beta, risk_penalty=0.0
        )
        
        rows.append([
            r['player_name'],
            r['position'],
            board_pos_map.get(ix, None),                       # <-- NEW: current ESPN board #
            round(float(r['ppg']), 2),
            f"{100*surv.get(ix,1.0):.0f}%",
            round(E_best_next[r['position']] - best_now[r['position']], 2),
            round(score, 2),
            ix
        ])

    rows.sort(key=lambda x: x[6], reverse=True)

    from tabulate import tabulate
    print("\n== Recommendations (as if it's YOUR pick next) ==")
    print(tabulate(
        rows[:topN],
        headers=["Player","Pos","ESPN#","PPG","Survive%","OppCost(Pos)","DAVAR","idx"],
        tablefmt="github"
    ))

    print("\nPos drain by your next pick (E[K_pos]):", {k: round(v,2) for k,v in E_drain.items()})

    owner_now = draft.pick_owner(draft.current_pick)
    pred_ix, hazard_current = predict_current_pick(df, draft, N_window=N_window, eta=eta)
    if pred_ix is not None:
        p = df.loc[pred_ix]
        prob = hazard_current.get(pred_ix, 0.0)
        print(f"\nModel predicts Team {owner_now} will pick: "
              f"{p['player_name']} ({p['position']}, {float(p['ppg']):.2f} PPG) — p={prob:.1%}")

    # --- NEW: your top recommendation (from the table you just saw) ---
    if rows:
        best_row = rows[0]
        print(f"Top rec for YOUR next turn: {best_row[0]} ({best_row[1]}) — "
              f"DAVAR {best_row[5]:.2f}, Survive {best_row[3]}")

    return rows, hazards, E_drain, pred_ix



DATA = "/Users/rjdp3/Documents/Personal/sacco-mono/backend-api/proto/data/player_rankings.csv"
ESPN = "/Users/rjdp3/Documents/Personal/sacco-mono/backend-api/proto/data/espn_rankings_final.csv"
N_TEAMS, ROUNDS, USER_TEAM = 12, 15, 4  # user is team 0 (change as needed)

def available_indices(df, taken):
    return [i for i in df.index if i not in taken]

def find_player(df, query):
    cand = df[df['player_name'].str.lower().str.contains(query.lower())]
    return list(cand.index)

def main():
    df = load_players(DATA)

    # Attach ESPN ranks (creates df['espn_rank'])
    try:
        espn = load_espn_ranks(ESPN)
        attach_espn_ranks_inplace(df, espn)
        report_espn_match_coverage(df)
    except Exception as e:
        print(f"[ESPN merge] Warning: {e} — falling back to global_rank for hazards.")

    draft = DraftState(n_teams=N_TEAMS, rounds=ROUNDS, user_team_ix=USER_TEAM)

    while not draft.is_complete():
        owner = draft.pick_owner(draft.current_pick)

        print_user_roster(df, draft)



        # Always show recs as if it's YOUR pick next (returns hazards for upcoming h picks)
        rows, hazards, E_drain, pred_ix = show_recs(
            df, draft,
            topN=24,         # how many rows to display
            N_window=24,     # ESPN top-N window for attention
            eta=0.8,         # softmax sharpness toward top of board
            alpha=0.9,       # DAVAR weight on pos-wait cost
            beta=0.6         # DAVAR cross-pos hedge weight
        )

        print(f"\nPick {draft.current_pick} is Team {owner}.")
        cmd = input("Enter pick: 'name' to pick by search, 'idx' to pick by idx, or 'auto' to auto-pick for owner: ").strip()

        if cmd.lower() == 'auto':
            if pred_ix is None:
                pred_ix, _ = predict_current_pick(df, draft, N_window=20, eta=0.7)
            pick_ix = pred_ix
            
        elif cmd.isdigit():
            pick_ix = int(cmd)

        else:
            matches = find_player(df, cmd)
            if not matches:
                print("No matches; try again."); continue
            # choose top by PPG among matches
            pick_ix = df.loc[matches].sort_values('ppg', ascending=False).index[0]

        # Validate roster need
        pos = df.loc[pick_ix, 'position']
        if not draft.teams[owner].can_draft(pos):
            print(f"Team {owner} cannot draft {pos} (slots full). Try another pick.")
            continue

        # Apply pick
        draft.taken.add(pick_ix)
        draft.teams[owner].picks.append(pick_ix)
        draft.teams[owner].add_player(pos)
        # NOTE: No Dirichlet/Bayesian update needed in ESPN hazard model.

        # Advance
        draft.current_pick += 1

    print("\nDraft complete!")
    u = draft.teams[draft.user_team_ix]
    roster = [[df.loc[ix,'player_name'], df.loc[ix,'position'], round(df.loc[ix,'ppg'],2)] for ix in u.picks]
    print(tabulate(roster, headers=["Player","Pos","PPG"], tablefmt="github"))


if __name__ == "__main__":
    main()
