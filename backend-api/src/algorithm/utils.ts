/**
 * TypeScript utility functions for fantasy draft algorithm
 * Ports mathematical helpers from Python modules
 */

import { Player, Position, PositionLists, POSITIONS } from './models.js';

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
export function getCurrentBestNow(\n  players: Map<number, Player>,\n  positionLists: PositionLists,\n  availableIndices: number[]\n): Record<Position, number> {\n  const availableSet = new Set(availableIndices);\n  const result: Partial<Record<Position, number>> = {};\n\n  for (const pos of POSITIONS) {\n    const playerList = positionLists[pos];\n    const bestIndex = playerList.find(idx => availableSet.has(idx));\n    \n    if (bestIndex !== undefined && players.has(bestIndex)) {\n      result[pos] = players.get(bestIndex)!.ppg;\n    } else {\n      result[pos] = 0.0;\n    }\n  }\n\n  return result as Record<Position, number>;\n}\n\n/**\n * Calculate expected best player PPG after position drain\n * Port of expected_best_next() from var.py\n */\nexport function getExpectedBestNext(\n  players: Map<number, Player>,\n  positionLists: PositionLists,\n  availableIndices: number[],\n  expectedDrain: Record<Position, number>,\n  floorPpg: number = 7.0\n): Record<Position, number> {\n  const availableSet = new Set(availableIndices);\n  const result: Partial<Record<Position, number>> = {};\n\n  for (const pos of POSITIONS) {\n    const playerList = positionLists[pos];\n    \n    // Find current best\n    const currentBestIndex = playerList.find(idx => availableSet.has(idx));\n    if (currentBestIndex === undefined) {\n      result[pos] = floorPpg;\n      continue;\n    }\n\n    // Calculate how many players will be taken at this position\n    const shift = Math.floor(expectedDrain[pos] || 0.0);\n    \n    // Find the player 'shift' positions down the list\n    let candidateIndex = currentBestIndex;\n    let count = 0;\n    \n    for (const idx of playerList) {\n      if (availableSet.has(idx)) {\n        if (count === shift) {\n          candidateIndex = idx;\n          break;\n        }\n        count++;\n      }\n    }\n\n    const candidate = players.get(candidateIndex);\n    result[pos] = candidate ? candidate.ppg : floorPpg;\n  }\n\n  return result as Record<Position, number>;\n}\n\n/**\n * Calculate league-wide replacement player ranks\n * Port of league_replacement_indices() from var.py\n */\nexport function getLeagueReplacementIndices(\n  nTeams: number,\n  lineup: Record<string, number>\n): Record<Position, number> {\n  const flex = lineup.FLEX || 0;\n  const flexShare = flex / 3.0; // Split FLEX among RB/WR/TE\n\n  return {\n    QB: Math.floor(nTeams * (lineup.QB || 1)),\n    RB: Math.floor(nTeams * (lineup.RB || 2) + nTeams * flexShare),\n    WR: Math.floor(nTeams * (lineup.WR || 2) + nTeams * flexShare),\n    TE: Math.floor(nTeams * (lineup.TE || 1) + nTeams * flexShare)\n  };\n}\n\n/**\n * Get replacement level PPG by position\n * Port of replacement_ppg_by_pos() from var.py\n */\nexport function getReplacementPpgByPosition(\n  players: Map<number, Player>,\n  positionLists: PositionLists,\n  availableIndices: number[],\n  replacementIndices: Record<Position, number>,\n  floorPpg: number = 6.0\n): Record<Position, number> {\n  const availableSet = new Set(availableIndices);\n  const result: Partial<Record<Position, number>> = {};\n\n  for (const pos of POSITIONS) {\n    const playerList = positionLists[pos];\n    const targetRank = Math.max(1, replacementIndices[pos]); // 1-based\n    \n    let rank = 0;\n    let targetIndex: number | null = null;\n    \n    // Find the k-th best available player at this position\n    for (const idx of playerList) {\n      if (availableSet.has(idx)) {\n        rank++;\n        if (rank === targetRank) {\n          targetIndex = idx;\n          break;\n        }\n      }\n    }\n\n    if (targetIndex === null) {\n      // Clamp to worst available if list is shorter than target rank\n      const availableAtPos = playerList.filter(idx => availableSet.has(idx));\n      if (availableAtPos.length > 0) {\n        targetIndex = availableAtPos[availableAtPos.length - 1];\n      }\n    }\n\n    const targetPlayer = targetIndex !== null ? players.get(targetIndex) : null;\n    result[pos] = targetPlayer ? targetPlayer.ppg : floorPpg;\n  }\n\n  return result as Record<Position, number>;\n}\n\n/**\n * Find player by name (case-insensitive substring match)\n * Port of find_player() from draft.py\n */\nexport function findPlayer(players: Player[], query: string): Player[] {\n  const lowerQuery = query.toLowerCase();\n  return players.filter(p => \n    p.playerName.toLowerCase().includes(lowerQuery)\n  );\n}\n\n/**\n * Get current ESPN board positions for available players\n * Port of current_espn_board_positions() from draft.py\n */\nexport function getCurrentEspnBoardPositions(\n  players: Map<number, Player>,\n  availableIndices: number[]\n): Record<number, number> {\n  // Sort available players by ESPN rank (or global rank fallback)\n  const availablePlayers = availableIndices\n    .map(idx => players.get(idx)!)\n    .filter(p => p !== undefined)\n    .sort((a, b) => {\n      const aRank = a.espnRank ?? a.globalRank ?? a.adp ?? 999;\n      const bRank = b.espnRank ?? b.globalRank ?? b.adp ?? 999;\n      return aRank - bRank;\n    });\n\n  const result: Record<number, number> = {};\n  availablePlayers.forEach((player, index) => {\n    result[player.index] = index + 1; // 1-based board position\n  });\n\n  return result;\n}\n\n/**\n * Format ADP value comparison\n * Port of adp_value_tag() from draft.py\n */\nexport function getAdpValueTag(nfcAdp: number | null | undefined, refPickNum: number): string {\n  if (nfcAdp === null || nfcAdp === undefined || isNaN(nfcAdp)) {\n    return \"N/A\";\n  }\n\n  const diff = Math.round(refPickNum - nfcAdp);\n  \n  if (diff > 0) {\n    return `value +${diff}`;\n  } else if (diff < 0) {\n    return `reach ${Math.abs(diff)}`;\n  } else {\n    return \"at ADP\";\n  }\n}\n\n/**\n * Deep clone an object (simple implementation for our data structures)\n */\nexport function deepClone<T>(obj: T): T {\n  if (obj === null || typeof obj !== 'object') {\n    return obj;\n  }\n  \n  if (obj instanceof Set) {\n    return new Set([...obj]) as unknown as T;\n  }\n  \n  if (obj instanceof Map) {\n    return new Map([...obj]) as unknown as T;\n  }\n  \n  if (Array.isArray(obj)) {\n    return obj.map(item => deepClone(item)) as unknown as T;\n  }\n  \n  const cloned = {} as T;\n  for (const key in obj) {\n    if (obj.hasOwnProperty(key)) {\n      cloned[key] = deepClone(obj[key]);\n    }\n  }\n  \n  return cloned;\n}\n\n/**\n * Ensure a rank column exists (ESPN rank or fallback to global rank)\n * Port of _ensure_espn_rank() from demand.py\n */\nexport function ensureRankColumn(players: Player[]): 'espnRank' | 'globalRank' | 'adp' {\n  const hasEspnRank = players.some(p => p.espnRank !== undefined && p.espnRank !== null);\n  if (hasEspnRank) return 'espnRank';\n  \n  const hasGlobalRank = players.some(p => p.globalRank !== undefined && p.globalRank !== null);\n  if (hasGlobalRank) return 'globalRank';\n  \n  return 'adp'; // Final fallback\n}\n\n/**\n * Round number to specified decimal places\n */\nexport function roundTo(num: number, decimals: number): number {\n  const factor = Math.pow(10, decimals);\n  return Math.round(num * factor) / factor;\n}\n\n/**\n * Clamp a number between min and max values\n */\nexport function clamp(value: number, min: number, max: number): number {\n  return Math.min(Math.max(value, min), max);\n}
