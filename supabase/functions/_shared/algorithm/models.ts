/**
 * TypeScript port of models.py
 * Core data structures for fantasy draft algorithm
 */

// Constants matching Python models.py
export const POSITIONS = ["RB", "WR", "QB", "TE"] as const;
export type Position = typeof POSITIONS[number];

export const LINEUP = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  FLEX: 1
} as const;

export const FLEX_SET = new Set<Position>(["RB", "WR", "TE"]);

export interface PositionNeeds {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  FLEX: number;
}

/**
 * Team class - tracks picks and roster needs
 * Port of Python Team dataclass
 */
export class Team {
  public picks: number[] = [];
  public need: PositionNeeds;

  constructor() {
    // Initialize with LINEUP requirements
    this.need = { ...LINEUP };
  }

  /**
   * Check if team can draft a player at given position
   * Matches Python Team.can_draft() logic
   */
  canDraft(pos: Position): boolean {
    // Check direct position need
    if (pos in this.need && this.need[pos] > 0) {
      return true;
    }
    
    // Check FLEX eligibility
    if (this.need.FLEX > 0 && FLEX_SET.has(pos)) {
      return true;
    }
    
    return false;
  }

  /**
   * Add player to team and update needs
   * Matches Python Team.add_player() logic
   */
  addPlayer(pos: Position): void {
    // First try to fill direct position need
    if (pos in this.need && this.need[pos] > 0) {
      this.need[pos]--;
    }
    // Otherwise try FLEX if eligible
    else if (this.need.FLEX > 0 && FLEX_SET.has(pos)) {
      this.need.FLEX--;
    }
  }

  /**
   * Calculate remaining bench slots for this team
   * Used in advanced DAVAR calculations
   */
  benchLeft(): number {
    const totalNeeded = Object.values(this.need).reduce((sum, need) => sum + need, 0);
    // Assume standard 16-round draft, subtract starters (9) = 7 bench slots
    const benchSlots = 7; // This could be configurable
    const benchFilled = Math.max(0, this.picks.length - (16 - totalNeeded));
    return Math.max(0, benchSlots - benchFilled);
  }
}

/**
 * DraftState class - manages overall draft state
 * Port of Python DraftState dataclass
 */
export class DraftState {
  public nTeams: number;
  public rounds: number;
  public userTeamIndex: number;
  public currentPick: number = 1;
  public teams: Team[];
  public taken: Set<number> = new Set();

  constructor(nTeams: number, rounds: number, userTeamIndex: number) {
    this.nTeams = nTeams;
    this.rounds = rounds;
    this.userTeamIndex = userTeamIndex;
    
    // Initialize teams
    this.teams = Array.from({ length: nTeams }, () => new Team());
  }

  /**
   * Calculate which team owns a specific pick number
   * Implements snake draft logic - matches Python pick_owner()
   */
  pickOwner(pickNumber: number): number {
    const round = Math.ceil(pickNumber / this.nTeams);
    const indexInRound = (pickNumber - 1) % this.nTeams;
    
    // Snake draft: even rounds are reversed
    return (round % 2 === 0) ? 
      (this.nTeams - 1 - indexInRound) : 
      indexInRound;
  }

  /**
   * Check if draft is complete
   * Matches Python is_complete() logic
   */
  isComplete(): boolean {
    return this.currentPick > this.nTeams * this.rounds;
  }

  /**
   * Get available player indices (not yet drafted)
   */
  availableIndices(allPlayerIndices: number[]): number[] {
    return allPlayerIndices.filter(idx => !this.taken.has(idx));
  }

  /**
   * Calculate steps until user's next pick
   * Port of steps_until_user_next_pick() from draft.py
   */
  stepsUntilUserNextPick(): number {
    let cur = this.currentPick;
    const total = this.nTeams * this.rounds;
    let steps = 0;

    // If it's user's pick right now, look AFTER they pick
    if (this.pickOwner(cur) === this.userTeamIndex) {
      cur++;
    }

    // Count steps until user's next pick
    while ((cur + steps) <= total && this.pickOwner(cur + steps) !== this.userTeamIndex) {
      steps++;
    }

    return steps;
  }
}

/**
 * Player interface for algorithm calculations
 * Matches the expected structure from Python DataFrame
 */
export interface Player {
  index: number;
  playerName: string;
  position: Position;
  team: string | null;
  ppg: number;
  adp?: number;
  globalRank?: number;
  espnRank?: number;
}

/**
 * Position lists for organizing players
 * Matches Python positional_lists() return type
 */
export interface PositionLists {
  QB: number[];
  RB: number[];
  WR: number[];
  TE: number[];
}

/**
 * Recommendation result structure
 * Matches the output format from show_recs()
 */
export interface DraftRecommendation {
  playerIndex: number;
  playerName: string;
  position: Position;
  espnBoardPosition: number | null;
  ppg: number;
  survivalPercent: string;
  adpValue: string;
  opportunityCost: number;
  davarScore: number;
}

/**
 * Utility functions for position handling
 */
export function isValidPosition(pos: string): pos is Position {
  return POSITIONS.includes(pos as Position);
}

export function isFlexEligible(pos: Position): boolean {
  return FLEX_SET.has(pos);
}

/**
 * Create position lists from players array
 * Port of positional_lists() from util.py
 */
export function createPositionLists(players: Player[]): PositionLists {
  const lists: PositionLists = {
    QB: [],
    RB: [],
    WR: [],
    TE: []
  };

  players.forEach(player => {
    if (isValidPosition(player.position)) {
      lists[player.position].push(player.index);
    }
  });

  return lists;
}
