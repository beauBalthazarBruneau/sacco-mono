# models.py
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import math

POSITIONS = ["RB","WR","QB","TE"]  # order just for display
LINEUP = {"QB":1, "RB":2, "WR":2, "TE":1, "FLEX":1}
FLEX_SET = {"RB","WR","TE"}

@dataclass
class Team:
    picks: List[int] = field(default_factory=list)        # indices into DF
    need: Dict[str,int] = field(default_factory=lambda: dict(LINEUP))

    def can_draft(self, pos: str) -> bool:
        if pos in self.need and self.need[pos] > 0:
            return True
        if 'FLEX' in self.need and self.need['FLEX'] > 0 and pos in FLEX_SET:
            return True
        return False

    def add_player(self, pos: str):
        if pos in self.need and self.need[pos] > 0:
            self.need[pos] -= 1
        elif 'FLEX' in self.need and self.need['FLEX'] > 0 and pos in FLEX_SET:
            self.need['FLEX'] -= 1

@dataclass
class DraftState:
    n_teams: int
    rounds: int
    user_team_ix: int
    current_pick: int = 1
    teams: List[Team] = field(init=False)
    taken: set[int] = field(default_factory=set)

    def __post_init__(self):
        self.teams = [Team() for _ in range(self.n_teams)]

    def pick_owner(self, pick_number: int) -> int:
        rnd = math.ceil(pick_number / self.n_teams)
        idx_in_round = (pick_number-1) % self.n_teams
        # snake
        return (self.n_teams-1 - idx_in_round) if (rnd % 2 == 0) else idx_in_round

    def is_complete(self) -> bool:
        return self.current_pick > self.n_teams * self.rounds
