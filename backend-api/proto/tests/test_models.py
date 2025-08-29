import pytest
from backend_api.proto.models import DraftState, Team, LINEUP, FLEX_SET


def test_pick_owner_snake_12_teams():
    ds = DraftState(n_teams=12, rounds=15, user_team_ix=0)
    # Round 1
    assert ds.pick_owner(1) == 0
    assert ds.pick_owner(6) == 5
    assert ds.pick_owner(12) == 11
    # Round 2 (reversed)
    assert ds.pick_owner(13) == 11
    assert ds.pick_owner(18) == 6
    assert ds.pick_owner(24) == 0
    # Round 3
    assert ds.pick_owner(25) == 0


def test_pick_owner_various_league_sizes():
    # 10-team
    ds10 = DraftState(n_teams=10, rounds=15, user_team_ix=0)
    assert ds10.pick_owner(10) == 9
    assert ds10.pick_owner(11) == 9
    # 8-team
    ds8 = DraftState(n_teams=8, rounds=15, user_team_ix=0)
    assert ds8.pick_owner(8) == 7
    assert ds8.pick_owner(9) == 7


def test_team_can_draft_and_add_player_reduces_needs():
    t = Team()
    # Initial needs as per LINEUP
    assert t.need["QB"] == LINEUP["QB"]
    assert t.need["RB"] == LINEUP["RB"]
    assert t.need["WR"] == LINEUP["WR"]
    assert t.need["TE"] == LINEUP["TE"]
    assert t.need["FLEX"] == LINEUP["FLEX"]

    assert t.can_draft("RB") is True
    t.add_player("RB")
    assert t.need["RB"] == LINEUP["RB"] - 1

    # Fill WR and then FLEX accepts RB/WR/TE
    t.add_player("WR")
    t.add_player("WR")
    # WR starters full; should use FLEX now
    assert t.can_draft("WR") is True  # because FLEX remains
    t.add_player("WR")
    assert t.need["FLEX"] == LINEUP["FLEX"] - 1

    # If FLEX full and slot position full, cannot draft
    # Fill TE starter
    t.add_player("TE")
    # FLEX already filled above, so another TE should be disallowed
    assert t.can_draft("TE") is False
