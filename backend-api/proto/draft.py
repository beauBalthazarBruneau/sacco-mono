# draft.py
import sys, readline
import pandas as pd
from tabulate import tabulate
from util import load_players, positional_lists, load_espn_ranks, attach_espn_ranks_inplace, report_espn_match_coverage, load_adp, attach_adp_inplace
from models import DraftState, LINEUP
import numpy as np

from demand import (
    forecast_until_next_pick_esbn,
    survival_probs,
    next_pick_probs_mix  # add to your imports
)
from var import expected_best_next, current_best_now, league_replacement_indices, replacement_ppg_by_pos, best_ix_by_pos_now, davar_esbn_deficit_weighted
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

def predict_current_pick(df, draft):
    """
    Predict the player the CURRENT team (draft.current_pick owner) will take,
    using the ESPN hazard for THIS pick only.
    Returns: (pred_ix, hazard_current_dict)
    """
    owner = draft.pick_owner(draft.current_pick)
    team = draft.teams[owner]
    avail_ix = available_indices(df, draft.taken)

    probs = next_pick_probs_mix(
        df, avail_ix, draft.current_pick, team
    )

    picked_player = np.random.choice(
        list(probs.keys()), 
        p=list(probs.values())
    )

    return picked_player, probs

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

def print_user_roster(df, draft, team_names=None):
    team = draft.teams[draft.user_team_ix]
    rows = _assign_user_lineup(df, team)
    counts = []
    for pos in ['QB', 'RB', 'WR', 'TE', 'FLEX']:
        filled = LINEUP.get(pos, 0) - team.need.get(pos, 0)
        remaining = team.need.get(pos, 0)
        counts.append([pos, max(filled, 0), max(remaining, 0)])

    team_name = team_names[draft.user_team_ix] if team_names else f"Team {draft.user_team_ix}"
    print(f"\n-- {team_name}'s roster so far --")
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

def adp_value_tag(nfc_adp, ref_pick_num):
    """Return a short tag like 'value +10', 'reach 15', or 'at ADP'."""
    try:
        if pd.isna(nfc_adp) or nfc_adp is None:
            return "N/A"
        adp = float(nfc_adp)
    except (TypeError, ValueError):
        return "N/A"  # unknown

    if not pd.notna(adp):
        return "N/A"

    diff = int(round(ref_pick_num - adp))  # >0 => value; <0 => reach
    if diff > 0:
        return f"value +{diff}"
    elif diff < 0:
        return f"reach {abs(diff)}"
    else:
        return "at ADP"


def show_recs(df, draft, topN=12, alpha=0.9, beta=0.6):
    # horizon until user's next pick
    h = steps_until_user_next_pick(draft)
    avail_ix = available_indices(df, draft.taken)
    pos_lists = positional_lists(df)

    team = draft.teams[draft.user_team_ix]
    ref_pick_num = draft.current_pick

    cap_left_by_pos = {}
    for pos in ['QB', 'RB', 'WR', 'TE']:
        cap = float(team.need.get(pos, 0))
        if pos in ('RB', 'WR', 'TE'):
            cap += float(team.need.get('FLEX', 0)) / 3.0

        cap_left_by_pos[pos] = cap
        
    owned_count_by_pos = {pos: 0 for pos in ['QB', 'RB', 'WR', 'TE']}
    for ix in team.picks:
        owned_count_by_pos[df.loc[ix, 'position']] += 1


    # ESPN-based hazards & drains
    hazards, E_drain = forecast_until_next_pick_esbn(df, draft, avail_ix, h)

    print(f"Horizon to your next pick (H) = {h}, sum(E[K_pos]) = {round(sum(E_drain.values()),2)}")
    
    board_pos_map = current_espn_board_positions(df, avail_ix)
    
    # Survival for candidate set (take top ~60 by PPG among available)
    cand_df = df.loc[avail_ix].sort_values('ppg', ascending=False).head(60)
    surv = survival_probs(hazards, cand_df.index)

    best_ix_map = best_ix_by_pos_now(pos_lists, avail_ix)
    surv_best_by_pos = {p: (surv.get(ix, 1.0) if ix is not None else 1.0) 
                        for p, ix in best_ix_map.items()}


    # Best-now and expected-best-next by position
    best_now = current_best_now(df, pos_lists, avail_ix)
    E_best_next = expected_best_next(df, pos_lists, avail_ix, E_drain)

    # Replacement indices
    repl_idx_map = league_replacement_indices(draft.n_teams, LINEUP)
    repl_ppg = replacement_ppg_by_pos(df, pos_lists, avail_ix, repl_idx_map)


    from var import remaining_var_budget_by_pos, accrued_var_by_pos

    # how many bench slots remain in THIS league/team
    bench_left_now = draft.teams[draft.user_team_ix].bench_left()

    # accrued VAR so far (starters + already-filled FLEX)
    A_by_pos = accrued_var_by_pos(df, draft.teams[draft.user_team_ix], LINEUP, repl_ppg)

    # remaining budget with bench awareness
    R_by_pos = remaining_var_budget_by_pos(
        df, pos_lists, avail_ix, draft.teams[draft.user_team_ix], LINEUP, repl_ppg,
        bench_left=bench_left_now, bench_weight=1.0  # tune weight if desired
)

    # Build table
    rows = []
    for ix, r in cand_df.iterrows():

        score = davar_esbn_deficit_weighted(
            df, ix,
            best_now, E_best_next, repl_ppg, surv_best_by_pos,
            survival_for_candidate=surv.get(ix, 1.0),
            accrued_var_by_pos=A_by_pos,
            remain_var_budget_by_pos=R_by_pos,
            alpha=0.9, beta=0.7,
            cap_left_by_pos=cap_left_by_pos,
            owned_count_by_pos=owned_count_by_pos,
            rho_overfill=1.0,
            phi_deficit=1.0
        )

        adp_tag = adp_value_tag(r.get('nfc_adp', None), ref_pick_num)

        rows.append([
            r['player_name'],
            r['position'],
            board_pos_map.get(ix, None),                       # <-- NEW: current ESPN board #
            round(float(r['ppg']), 2),
            f"{100*surv.get(ix,1.0):.0f}%",
            adp_tag,
            round(E_best_next[r['position']] - best_now[r['position']], 2),
            round(score, 2),
            ix
        ])

    rows.sort(key=lambda x: x[7], reverse=True)

    from tabulate import tabulate
    print("\n== Recommendations (as if it's YOUR pick next) ==")
    print(tabulate(
    rows[:topN],
    headers=["Player","Pos","ESPN#","PPG","Survive%","ADP","OppCost(Pos)","DAVAR","idx"],
    tablefmt="github"
    ))

    print("\nPos drain by your next pick (E[K_pos]):", {k: round(v,2) for k,v in E_drain.items()})

    owner_now = draft.pick_owner(draft.current_pick)
    pred_ix, hazard_current = predict_current_pick(df, draft)
    if pred_ix is not None:
        p = df.loc[pred_ix]
        prob = hazard_current.get(pred_ix, 0.0)
        print(f"\nModel predicts Team {owner_now} will pick: "
              f"{p['player_name']} ({p['position']}, {float(p['ppg']):.2f} PPG) — p={prob:.1%}")

    # --- NEW: your top recommendation (from the table you just saw) ---
    if rows:
        best_row = rows[0]
        print(f"Top rec for YOUR next turn: {best_row[0]} ({best_row[1]}) — "
              f"DAVAR {best_row[7]:.2f}, Survive {best_row[4]}")   

    return rows, hazards, E_drain, pred_ix

DATA = "data/player_rankings.csv"
ESPN = "data/espn_rankings_final.csv"
ADP = "data/ppr_adp_new.csv"
ROUNDS = 15  # default rounds, can be made configurable later

def available_indices(df, taken):
    return [i for i in df.index if i not in taken]

def find_player(df, query):
    cand = df[df['player_name'].str.lower().str.contains(query.lower())]
    return list(cand.index)

def get_draft_config():
    """Get draft configuration from user"""
    print("=== Fantasy Football Draft Setup ===")
    
    # Get number of teams
    while True:
        try:
            n_teams = int(input("Enter number of teams in the draft: "))
            if n_teams >= 2 and n_teams <= 16:
                break
            else:
                print("Please enter a number between 2 and 16.")
        except ValueError:
            print("Please enter a valid number.")
    
    # Get number of rounds
    while True:
        try:
            rounds = int(input(f"Enter number of rounds (default {ROUNDS}): ") or ROUNDS)
            if rounds >= 1 and rounds <= 20:
                break
            else:
                print("Please enter a number between 1 and 20.")
        except ValueError:
            print("Please enter a valid number.")
    
    return n_teams, rounds

def get_team_names(n_teams):
    """Get team names from user in draft order (1st pick to last pick)"""
    print(f"\n=== Enter Team Names in Draft Order ===")
    print(f"Enter the names of {n_teams} teams in the order they will draft (1st pick to last pick)")
    print("This will be mapped to the snake draft order automatically.\n")
    
    team_names = []
    for i in range(n_teams):
        while True:
            name = input(f"Team {i+1} (pick #{i+1}): ").strip()
            if name:
                team_names.append(name)
                break
            print("Please enter a valid team name.")
    
    return team_names

def get_snake_draft_order(n_teams, rounds):
    """Generate the complete snake draft order"""
    draft_order = []
    for round_num in range(1, rounds + 1):
        if round_num % 2 == 1:  # Odd rounds: 1, 2, 3, ..., n
            round_order = list(range(n_teams))
        else:  # Even rounds: n, n-1, ..., 2, 1
            round_order = list(range(n_teams - 1, -1, -1))
        
        for team_idx in round_order:
            draft_order.append(team_idx)
    
    return draft_order

def print_draft_order(team_names, draft_order):
    """Print the complete draft order for reference"""
    print(f"\n=== Complete Draft Order ===")
    for i, team_idx in enumerate(draft_order):
        round_num = (i // len(team_names)) + 1
        pick_in_round = (i % len(team_names)) + 1
        print(f"Pick {i+1:2d} (Round {round_num:2d}.{pick_in_round:2d}): {team_names[team_idx]}")
    print()

def main():
    df = load_players(DATA)

    # Attach ESPN ranks (creates df['espn_rank'])
    try:
        espn = load_espn_ranks(ESPN)
        attach_espn_ranks_inplace(df, espn)
        report_espn_match_coverage(df)

    except Exception as e:
        print(f"[ESPN merge] Warning: {e} — falling back to global_rank for hazards.")

    adp = load_adp(ADP)
    attach_adp_inplace(df, adp)

    # Get draft configuration from user
    n_teams, rounds = get_draft_config()
    
    # Get team names from user
    team_names = get_team_names(n_teams)
    
    # Generate snake draft order
    draft_order = get_snake_draft_order(n_teams, rounds)
    
    # Print the complete draft order for reference
    print_draft_order(team_names, draft_order)
    
    # Ask user which team they are
    print("Which team are you?")
    for i, name in enumerate(team_names):
        print(f"{i+1}. {name}")
    
    while True:
        try:
            user_choice = int(input(f"Enter your team number (1-{n_teams}): ")) - 1
            if 0 <= user_choice < n_teams:
                user_team = user_choice
                break
            else:
                print(f"Please enter a number between 1 and {n_teams}")
        except ValueError:
            print("Please enter a valid number")

    draft = DraftState(n_teams=n_teams, rounds=rounds, user_team_ix=user_team)

    while not draft.is_complete():
        owner = draft.pick_owner(draft.current_pick)
        owner_name = team_names[owner]

        print_user_roster(df, draft, team_names)

        # Always show recs as if it's YOUR pick next (returns hazards for upcoming h picks)
        rows, hazards, E_drain, pred_ix = show_recs(
            df, draft,
            topN=24,         # how many rows to display
            alpha=0.9,       # DAVAR weight on pos-wait cost
            beta=0.6         # DAVAR cross-pos hedge weight
        )

        print(f"\nPick {draft.current_pick} is {owner_name} (Team {owner}).")
        cmd = input("Enter pick: 'name' to pick by search, 'idx' to pick by idx, or 'auto' to auto-pick for owner: ").strip()

        if cmd.lower() == 'auto':
            if pred_ix is None:
                pred_ix, _ = predict_current_pick(df, draft)
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
            print(f"{owner_name} cannot draft {pos} (slots full). Try another pick.")
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
    print(f"\n=== Final Roster for {team_names[user_team]} ===")
    print(tabulate(roster, headers=["Player","Pos","PPG"], tablefmt="github"))


if __name__ == "__main__":
    main()
