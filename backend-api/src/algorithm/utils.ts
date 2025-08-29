/**
 * TypeScript utility functions for fantasy draft algorithm
 * Ports mathematical helpers from Python modules
 */

import { Player, Position, PositionLists, POSITIONS } from './models';

/**
 * Normalize a dictionary of probabilities to sum to 1
 * Port of _normalize() from demand.py
 */
export function normalize(probs: Record<number, number>): Record<number, number> {
  const sum = Object.values(probs).reduce((total, val) => total + Math.max(0, val), 0);
  
  if (sum <= 0) {
    return Object.fromEntries(Object.keys(probs).map(k => [Number(k), 0.0]));
  }
  
  const result: Record<number, number> = {};
  for (const [key, val] of Object.entries(probs)) {
    result[Number(key)] = val > 0 ? val / sum : 0.0;
  }
  
  return result;
}

/**
 * Softmax function for probability distributions
 * Used in ESPN hazard calculations
 */
export function softmax(scores: number[], temperature: number = 1.0): number[] {
  // Numerical stability: subtract max
  const maxScore = Math.max(...scores);
  const expScores = scores.map(s => Math.exp((s - maxScore) / temperature));
  const sumExp = expScores.reduce((sum, exp) => sum + exp, 0);
  
  return expScores.map(exp => exp / sumExp);
}

/**
 * Get current best player at each position from available players
 * Port of current_best_now() from var.py
 */
export function getCurrentBestNow(
  players: Map<number, Player>,
  positionLists: PositionLists,
  availableIndices: number[]
): Record<Position, number> {
  const availableSet = new Set(availableIndices);
  const result: Partial<Record<Position, number>> = {};

  for (const pos of POSITIONS) {
    const playerList = positionLists[pos];
    const bestIndex = playerList.find(idx => availableSet.has(idx));
    
    if (bestIndex !== undefined && players.has(bestIndex)) {
      result[pos] = players.get(bestIndex)!.ppg;
    } else {
      result[pos] = 0.0;
    }
  }

  return result as Record<Position, number>;
}

/**
 * Calculate expected best player PPG after position drain
 * Port of expected_best_next() from var.py
 */
export function getExpectedBestNext(
  players: Map<number, Player>,
  positionLists: PositionLists,
  availableIndices: number[],
  expectedDrain: Record<Position, number>,
  floorPpg: number = 7.0
): Record<Position, number> {
  const availableSet = new Set(availableIndices);
  const result: Partial<Record<Position, number>> = {};

  for (const pos of POSITIONS) {
    const playerList = positionLists[pos];
    
    // Find current best
    const currentBestIndex = playerList.find(idx => availableSet.has(idx));
    if (currentBestIndex === undefined) {
      result[pos] = floorPpg;
      continue;
    }

    // Calculate how many players will be taken at this position
    const shift = Math.floor(expectedDrain[pos] || 0.0);
    
    // Find the player 'shift' positions down the list
    let candidateIndex = currentBestIndex;
    let count = 0;
    
    for (const idx of playerList) {
      if (availableSet.has(idx)) {
        if (count === shift) {
          candidateIndex = idx;
          break;
        }
        count++;
      }
    }

    const candidate = players.get(candidateIndex);
    result[pos] = candidate ? candidate.ppg : floorPpg;
  }

  return result as Record<Position, number>;
}

/**
 * Calculate league-wide replacement player ranks
 * Port of league_replacement_indices() from var.py
 */
export function getLeagueReplacementIndices(
  nTeams: number,
  lineup: Record<string, number>
): Record<Position, number> {
  const flex = lineup.FLEX || 0;
  const flexShare = flex / 3.0; // Split FLEX among RB/WR/TE

  return {
    QB: Math.floor(nTeams * (lineup.QB || 1)),
    RB: Math.floor(nTeams * (lineup.RB || 2) + nTeams * flexShare),
    WR: Math.floor(nTeams * (lineup.WR || 2) + nTeams * flexShare),
    TE: Math.floor(nTeams * (lineup.TE || 1) + nTeams * flexShare)
  };
}

/**
 * Get replacement level PPG by position
 * Port of replacement_ppg_by_pos() from var.py
 */
export function getReplacementPpgByPosition(
  players: Map<number, Player>,
  positionLists: PositionLists,
  availableIndices: number[],
  replacementIndices: Record<Position, number>,
  floorPpg: number = 6.0
): Record<Position, number> {
  const availableSet = new Set(availableIndices);
  const result: Partial<Record<Position, number>> = {};

  for (const pos of POSITIONS) {
    const playerList = positionLists[pos];
    const targetRank = Math.max(1, replacementIndices[pos]); // 1-based
    
    let rank = 0;
    let targetIndex: number | null = null;
    
    // Find the k-th best available player at this position
    for (const idx of playerList) {
      if (availableSet.has(idx)) {
        rank++;
        if (rank === targetRank) {
          targetIndex = idx;
          break;
        }
      }
    }

    if (targetIndex === null) {
      // Clamp to worst available if list is shorter than target rank
      const availableAtPos = playerList.filter(idx => availableSet.has(idx));
      if (availableAtPos.length > 0) {
        targetIndex = availableAtPos[availableAtPos.length - 1];
      }
    }

    const targetPlayer = targetIndex !== null ? players.get(targetIndex) : null;
    result[pos] = targetPlayer ? targetPlayer.ppg : floorPpg;
  }

  return result as Record<Position, number>;
}

/**
 * Find player by name (case-insensitive substring match)
 * Port of find_player() from draft.py
 */
export function findPlayer(players: Player[], query: string): Player[] {
  const lowerQuery = query.toLowerCase();
  return players.filter(p => 
    p.playerName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get current ESPN board positions for available players
 * Port of current_espn_board_positions() from draft.py
 */
export function getCurrentEspnBoardPositions(
  players: Map<number, Player>,
  availableIndices: number[]
): Record<number, number> {
  // Sort available players by ESPN rank (or global rank fallback)
  const availablePlayers = availableIndices
    .map(idx => players.get(idx)!)
    .filter(p => p !== undefined)
    .sort((a, b) => {
      const aRank = a.espnRank ?? a.globalRank ?? a.adp ?? 999;
      const bRank = b.espnRank ?? b.globalRank ?? b.adp ?? 999;
      return aRank - bRank;
    });

  const result: Record<number, number> = {};
  availablePlayers.forEach((player, index) => {
    result[player.index] = index + 1; // 1-based board position
  });

  return result;
}

/**
 * Format ADP value comparison
 * Port of adp_value_tag() from draft.py
 */
export function getAdpValueTag(nfcAdp: number | null | undefined, refPickNum: number): string {
  if (nfcAdp === null || nfcAdp === undefined || isNaN(nfcAdp)) {
    return "N/A";
  }

  const diff = Math.round(refPickNum - nfcAdp);
  
  if (diff > 0) {
    return `value +${diff}`;
  } else if (diff < 0) {
    return `reach ${Math.abs(diff)}`;
  } else {
    return "at ADP";
  }
}

/**
 * Calculate opportunity costs for each position
 * Port from draft.py
 */
export function calculateAllOpportunityCosts(
  bestNowByPosition: Record<Position, number>,
  expectedBestNextByPosition: Record<Position, number>
): Record<Position, number> {
  const result: Partial<Record<Position, number>> = {};
  
  for (const pos of POSITIONS) {
    const currentBest = bestNowByPosition[pos] || 0;
    const expectedBest = expectedBestNextByPosition[pos] || 0;
    result[pos] = Math.max(0, currentBest - expectedBest);
  }
  
  return result as Record<Position, number>;
}

/**
 * Round number to specified decimal places
 */
export function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Ensure a rank column exists (ESPN rank or fallback to global rank)
 * Port of _ensure_espn_rank() from demand.py
 */
export function ensureRankColumn(players: Player[]): 'espnRank' | 'globalRank' | 'adp' {
  const hasEspnRank = players.some(p => p.espnRank !== undefined && p.espnRank !== null);
  if (hasEspnRank) return 'espnRank';
  
  const hasGlobalRank = players.some(p => p.globalRank !== undefined && p.globalRank !== null);
  if (hasGlobalRank) return 'globalRank';
  
  return 'adp'; // Final fallback
}
