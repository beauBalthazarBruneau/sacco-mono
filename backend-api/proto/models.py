from dataclasses import dataclass, field
from typing import Dict, List, Optional
import math

POSITIONS = ["RB","WR","QB","TE"]
LINEUP = {"QB":1, "RB":2, "WR":2, "TE":1, "FLEX":1}
FLEX_SET = {"RB","WR","TE"}

def _starters_total(lineup: dict) -> int:
    # sum of *starting* slots including FLEX
    return int(sum(lineup.values()))

@dataclass
class Team:
    picks: List[int] = field(default_factory=list)        # indices into DF
    need: Dict[str,int] = field(default_factory=lambda: dict(LINEUP))
    bench_total: int = 0                                  # <-- NEW: bench capacity (per team)

    def starters_filled_so_far(self) -> int:
        """How many starter slots (incl FLEX) are already filled."""
        total = _starters_total(LINEUP)
        # remaining starters = sum of needs over all starter keys (incl FLEX)
        remaining = sum(int(self.need.get(k, 0)) for k in LINEUP.keys())
        return max(0, total - remaining)

    def bench_left(self) -> int:
        """Bench slots still open."""
        starters_filled = self.starters_filled_so_far()
        bench_used = max(0, len(self.picks) - starters_filled)
        return max(0, int(self.bench_total) - bench_used)

    def can_draft(self, pos: str) -> bool:
        # still need this position as a starter?
        if pos in self.need and self.need[pos] > 0:
            return True
        # or FLEX can take it?
        if 'FLEX' in self.need and self.need['FLEX'] > 0 and pos in FLEX_SET:
            return True
        # otherwise, any pos is fine if bench remains
        if self.bench_left() > 0:
            return True
        return False

    def add_player(self, pos: str):
        # fill a starter slot first if available (pos or FLEX)
        if pos in self.need and self.need[pos] > 0:
            self.need[pos] -= 1
        elif 'FLEX' in self.need and self.need['FLEX'] > 0 and pos in FLEX_SET:
            self.need['FLEX'] -= 1
        # else it’s a bench pick; needs don’t change

@dataclass
class DraftState:
    n_teams: int
    rounds: int                   # total picks per team (starters + bench)
    user_team_ix: int
    current_pick: int = 1
    teams: List[Team] = field(init=False)
    taken: set[int] = field(default_factory=set)

    def __post_init__(self):
        self.teams = [Team() for _ in range(self.n_teams)]
        # compute bench capacity per team from rounds and lineup
        starters_total = _starters_total(LINEUP)
        bench = max(0, int(self.rounds) - starters_total)
        # if bench would be negative, the config is invalid
        if bench < 0:
            raise ValueError(f"rounds={self.rounds} is less than starters={starters_total}")
        for t in self.teams:
            t.bench_total = bench

    def pick_owner(self, pick_number: int) -> int:
        rnd = math.ceil(pick_number / self.n_teams)
        idx_in_round = (pick_number-1) % self.n_teams
        # snake
        return (self.n_teams-1 - idx_in_round) if (rnd % 2 == 0) else idx_in_round

    def is_complete(self) -> bool:
        # unchanged: each team gets exactly `rounds` picks
        return self.current_pick > self.n_teams * self.rounds
