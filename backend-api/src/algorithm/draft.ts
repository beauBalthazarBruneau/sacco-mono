/**
 * Main draft recommendation engine
 * TypeScript port of draft.py show_recs() function and related functionality
 */

import { 
  Player, 
  Position, 
  DraftState, 
  DraftRecommendation, 
  createPositionLists,
  isValidPosition 
} from './models';

import {
  getCurrentBestNow,
  getExpectedBestNext,
  getLeagueReplacementIndices,
  getReplacementPpgByPosition,
  getCurrentEspnBoardPositions,
  getAdpValueTag,
  roundTo
} from './utils';

import {
  forecastUntilNextPickEsbn,
  getSurvivalProbabilities,
  predictCurrentPick,
  getBestIndexByPositionNow
} from './survival';

import {
  calculateDavarEsbn,
  scorePlayersWithDavar,
  calculateAllOpportunityCosts,
  ScoringContext
} from './scoring';

/**
 * Main recommendation engine
 * Port of show_recs() from draft.py
 */
export interface RecommendationOptions {
  topN?: number;        // Number of recommendations to return
  alpha?: number;       // DAVAR weight on position-wait cost  
  beta?: number;        // DAVAR cross-position hedge weight
  candidatePoolSize?: number; // Size of candidate pool to consider
}

export interface RecommendationResult {
  recommendations: DraftRecommendation[];
  horizon: number;
  positionDrain: Record<Position, number>;
  predictedPick?: {
    playerIndex: number;
    playerName: string;
    position: Position;
    probability: number;
  };
  debug?: {
    availableCount: number;
    candidatePoolSize: number;
    bestNowByPosition: Record<Position, number>;
    expectedBestNextByPosition: Record<Position, number>;
    replacementPpgByPosition: Record<Position, number>;
  };
}

export function generateRecommendations(
  players: Map<number, Player>,
  draftState: DraftState,
  options: RecommendationOptions = {}
): RecommendationResult {
  const {
    topN = 12,
    alpha = 0.9,
    beta = 0.6,
    candidatePoolSize = 60
  } = options;

  // Calculate horizon until user's next pick
  const horizon = draftState.stepsUntilUserNextPick();
  
  // Get available player indices
  const allIndices = Array.from(players.keys());
  const availableIndices = draftState.availableIndices(allIndices);
  
  // Create position lists from available players
  const availablePlayers = availableIndices
    .map(idx => players.get(idx)!)
    .filter(p => p !== undefined);
  
  const positionLists = createPositionLists(availablePlayers);

  // ESPN-based hazards & position drains
  const { hazards, expectedDrain } = forecastUntilNextPickEsbn(
    players,
    draftState,
    availableIndices,
    horizon
  );

  // Current ESPN board positions
  const boardPositionMap = getCurrentEspnBoardPositions(players, availableIndices);
  
  // Select candidate pool (top players by PPG among available)
  const candidatePool = availablePlayers
    .sort((a, b) => b.ppg - a.ppg)
    .slice(0, candidatePoolSize);

  // Calculate survival probabilities for candidates
  const candidateIndices = candidatePool.map(p => p.index);
  const survivalProbs = getSurvivalProbabilities(hazards, candidateIndices);

  // Calculate current best and expected best next by position
  const bestNowByPosition = getCurrentBestNow(players, positionLists, availableIndices);
  const expectedBestNextByPosition = getExpectedBestNext(
    players,
    positionLists,
    availableIndices,
    expectedDrain
  );

  // Calculate replacement level players
  const replacementIndices = getLeagueReplacementIndices(
    draftState.nTeams,
    { QB: 1, RB: 2, WR: 2, TE: 1, FLEX: 1 }
  );

  const replacementPpgByPosition = getReplacementPpgByPosition(
    players,
    positionLists,
    availableIndices,
    replacementIndices
  );

  // Score all candidates using DAVAR
  const scoringContext: ScoringContext = {
    bestNowByPosition,
    expectedBestNextByPosition,
    replacementPpgByPosition,
    survivalProbabilities: survivalProbs,
    options: { alpha, beta }
  };

  const scoredPlayers = scorePlayersWithDavar(candidatePool, scoringContext);

  // Calculate opportunity costs by position
  const opportunityCosts = calculateAllOpportunityCosts(
    bestNowByPosition,
    expectedBestNextByPosition
  );

  // Build recommendation list
  const recommendations: DraftRecommendation[] = scoredPlayers
    .slice(0, topN)
    .map(result => {
      const player = result.player;
      const espnBoardPos = boardPositionMap[player.index] || null;
      const adpValue = getAdpValueTag(player.adp, draftState.currentPick);
      const opportunityCost = opportunityCosts[player.position];

      return {
        playerIndex: player.index,
        playerName: player.playerName,
        position: player.position,
        espnBoardPosition: espnBoardPos,
        ppg: roundTo(player.ppg, 2),
        survivalPercent: `${Math.round(result.survivalProbability * 100)}%`,
        adpValue: adpValue,
        opportunityCost: roundTo(opportunityCost, 2),
        davarScore: roundTo(result.davarScore, 2)
      };
    });

  // Predict current pick
  let predictedPick: RecommendationResult['predictedPick'] = undefined;
  const prediction = predictCurrentPick(players, draftState, availableIndices);
  
  if (prediction.predictedIndex !== null) {
    const predictedPlayer = players.get(prediction.predictedIndex);
    if (predictedPlayer) {
      const maxProb = Math.max(...Object.values(prediction.probabilities));
      predictedPick = {
        playerIndex: prediction.predictedIndex,
        playerName: predictedPlayer.playerName,
        position: predictedPlayer.position,
        probability: maxProb
      };
    }
  }

  return {
    recommendations,
    horizon,
    positionDrain: expectedDrain,
    predictedPick,
    debug: {
      availableCount: availableIndices.length,
      candidatePoolSize: candidatePool.length,
      bestNowByPosition,
      expectedBestNextByPosition,
      replacementPpgByPosition
    }
  };
}

/**
 * Find players by search query
 * Port of find_player() from draft.py
 */
export function findPlayers(
  players: Map<number, Player>,
  query: string
): Player[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  const results: Player[] = [];

  for (const player of players.values()) {
    if (player.playerName.toLowerCase().includes(lowerQuery)) {
      results.push(player);
    }
  }

  // Sort by PPG descending
  return results.sort((a, b) => b.ppg - a.ppg);
}

/**
 * Get available player indices (not yet drafted)
 * Port of available_indices() from draft.py
 */
export function getAvailableIndices(
  players: Map<number, Player>,
  takenIndices: Set<number>
): number[] {
  return Array.from(players.keys()).filter(idx => !takenIndices.has(idx));
}

/**
 * Validate if a pick is legal for a team
 */
export function validatePick(
  playerIndex: number,
  players: Map<number, Player>,
  draftState: DraftState,
  teamIndex: number
): {
  valid: boolean;
  reason?: string;
} {
  const player = players.get(playerIndex);
  if (!player) {
    return { valid: false, reason: "Player not found" };
  }

  if (draftState.taken.has(playerIndex)) {
    return { valid: false, reason: "Player already drafted" };
  }

  if (!isValidPosition(player.position)) {
    return { valid: false, reason: "Invalid position" };
  }

  const team = draftState.teams[teamIndex];
  if (!team.canDraft(player.position)) {
    return { 
      valid: false, 
      reason: `Team cannot draft ${player.position} (roster slots full)` 
    };
  }

  return { valid: true };
}

/**
 * Apply a draft pick to the draft state
 */
export function applyDraftPick(
  playerIndex: number,
  players: Map<number, Player>,
  draftState: DraftState
): {
  success: boolean;
  message?: string;
  pickDetails?: {
    playerName: string;
    position: Position;
    team: number;
    pickNumber: number;
  };
} {
  const player = players.get(playerIndex);
  if (!player) {
    return { success: false, message: "Player not found" };
  }

  // Determine which team owns this pick
  const teamIndex = draftState.pickOwner(draftState.currentPick);

  // Validate the pick
  const validation = validatePick(playerIndex, players, draftState, teamIndex);
  if (!validation.valid) {
    return { success: false, message: validation.reason };
  }

  // Apply the pick
  draftState.taken.add(playerIndex);
  draftState.teams[teamIndex].picks.push(playerIndex);
  draftState.teams[teamIndex].addPlayer(player.position);
  
  const pickNumber = draftState.currentPick;
  draftState.currentPick++;

  return {
    success: true,
    pickDetails: {
      playerName: player.playerName,
      position: player.position,
      team: teamIndex,
      pickNumber
    }
  };
}

/**
 * Generate a simple text summary of recommendations
 * Similar to the console output from the Python version
 */
export function formatRecommendationSummary(
  result: RecommendationResult,
  draftState: DraftState
): string {
  const lines: string[] = [];
  
  lines.push(`Horizon to your next pick (H) = ${result.horizon}`);
  lines.push(`Sum of E[K_pos] = ${roundTo(Object.values(result.positionDrain).reduce((a, b) => a + b, 0), 2)}`);
  lines.push('');
  lines.push('== Recommendations (as if it\'s YOUR pick next) ==');
  
  // Header
  lines.push('Player\t\tPos\tESPN#\tPPG\tSurvive%\tADP\t\tOppCost\tDAVAR');
  lines.push('-'.repeat(80));
  
  // Recommendations
  for (const rec of result.recommendations) {
    const espn = rec.espnBoardPosition?.toString() || '-';
    const line = [
      rec.playerName.padEnd(16),
      rec.position,
      espn.padStart(5),
      rec.ppg.toString().padStart(5),
      rec.survivalPercent.padStart(8),
      rec.adpValue.padEnd(10),
      rec.opportunityCost.toString().padStart(7),
      rec.davarScore.toString().padStart(6)
    ].join('\t');
    lines.push(line);
  }
  
  lines.push('');
  lines.push('Position drain by your next pick:');
  for (const [pos, drain] of Object.entries(result.positionDrain)) {
    lines.push(`  ${pos}: ${roundTo(drain, 2)}`);
  }
  
  if (result.predictedPick) {
    const owner = draftState.pickOwner(draftState.currentPick);
    lines.push('');
    lines.push(`Model predicts Team ${owner} will pick: ${result.predictedPick.playerName} ` +
               `(${result.predictedPick.position}) — p=${Math.round(result.predictedPick.probability * 100)}%`);
  }
  
  if (result.recommendations.length > 0) {
    const topRec = result.recommendations[0];
    lines.push('');
    lines.push(`Top rec for YOUR next turn: ${topRec.playerName} (${topRec.position}) — ` +
               `DAVAR ${topRec.davarScore}, Survive ${topRec.survivalPercent}`);
  }
  
  return lines.join('\n');
}

/**
 * Create a sample draft state for testing
 */
export function createSampleDraftState(
  nTeams: number = 12,
  rounds: number = 15,
  userTeamIndex: number = 0,
  currentPick: number = 1
): DraftState {
  const draftState = new DraftState(nTeams, rounds, userTeamIndex);
  draftState.currentPick = currentPick;
  return draftState;
}

/**
 * Load players from a data structure
 * Helper for creating the player map from various data sources
 */
export function createPlayersMap(playerData: Array<{
  index: number;
  playerName: string;
  position: string;
  team?: string | null;
  ppg: number;
  adp?: number;
  globalRank?: number;
  espnRank?: number;
}>): Map<number, Player> {
  const players = new Map<number, Player>();

  for (const data of playerData) {
    if (!isValidPosition(data.position)) {
      continue; // Skip invalid positions
    }

    const player: Player = {
      index: data.index,
      playerName: data.playerName,
      position: data.position as Position,
      team: data.team || null,
      ppg: data.ppg,
      adp: data.adp,
      globalRank: data.globalRank,
      espnRank: data.espnRank
    };

    players.set(data.index, player);
  }

  return players;
}
