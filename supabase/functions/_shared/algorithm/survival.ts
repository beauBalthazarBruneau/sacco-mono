/**
 * TypeScript port of survival probability and ESPN hazard calculations
 * Ports demand.py functionality for predicting picks and player availability
 */

import { Player, Position, DraftState, Team } from './models.ts';
import { normalize, softmax, ensureRankColumn } from './utils.ts';

/**
 * Player-level ESPN hazard for one upcoming pick
 * Port of esbn_pick_probs_for_team() from demand.py
 */
export function getEspnPickProbsForTeam(
  players: Map<number, Player>,
  availableIndices: number[],
  team: Team,
  options: {
    N?: number;           // main ESPN top-N attention window
    eta?: number;         // sharpness for top-N
    tailK?: number;       // how many "just off screen" players to consider
    tailW?: number;       // % of attention mass reserved for the tail
    etaTail?: number;     // gentler decay for tail
  } = {}
): Record<number, number> {
  const { 
    N = 10,
    eta = 0.4,
    tailK = 5,
    tailW = 0.10,
    etaTail = 0.10
  } = options;

  const availablePlayers = availableIndices
    .map(idx => players.get(idx)!)
    .filter(p => p !== undefined);

  if (availablePlayers.length === 0) {
    return {};
  }

  // Determine rank column to use
  const rankCol = ensureRankColumn(availablePlayers);

  // Progressive window widening if necessary
  const windows = [N, Math.max(N, 15), Math.max(N, 25), availablePlayers.length];

  for (const window of windows) {
    // Sort by rank and take top window
    const sortedPlayers = [...availablePlayers].sort((a, b) => {
      const aRank = (a[rankCol] as number) ?? 999;
      const bRank = (b[rankCol] as number) ?? 999;
      return aRank - bRank;
    });

    const topN = sortedPlayers.slice(0, window);

    // Main window softmax (top-N)
    const topScores = topN.map(p => {
      const rank = (p[rankCol] as number) ?? 999;
      return -eta * rank;
    });

    const topWeights = softmax(topScores);
    const probsTop: Record<number, number> = {};
    topN.forEach((player, i) => {
      probsTop[player.index] = topWeights[i];
    });

    // Leaky tail just outside top-N
    const tailPool = sortedPlayers
      .slice(window)
      .filter(p => !topN.some(tp => tp.index === p.index))
      .slice(0, tailK);

    let probs = probsTop;

    if (tailPool.length > 0 && tailW > 0) {
      const tailScores = tailPool.map(p => {
        const rank = (p[rankCol] as number) ?? 999;
        return -etaTail * rank;
      });

      const tailWeights = softmax(tailScores);
      
      // Scale masses: (1 - tailW) for top, tailW for tail
      for (const [idx, weight] of Object.entries(probsTop)) {
        probs[Number(idx)] = (1.0 - tailW) * weight;
      }

      tailPool.forEach((player, i) => {
        probs[player.index] = tailW * tailWeights[i];
      });
    }

    // Roster need filter, then renormalize
    let anyAllowed = false;
    
    for (const [idx, prob] of Object.entries(probs)) {
      const player = players.get(Number(idx));
      if (!player || !team.canDraft(player.position)) {
        probs[Number(idx)] = 0.0;
      } else {
        anyAllowed = true;
      }
    }

    if (anyAllowed && Object.values(probs).reduce((sum, p) => sum + p, 0) > 0) {
      return normalize(probs);
    }
  }

  // Final fallback: best-ranked legal player
  const sortedAvailable = availablePlayers.sort((a, b) => {
    const aRank = (a[rankCol] as number) ?? 999;
    const bRank = (b[rankCol] as number) ?? 999;
    return aRank - bRank;
  });

  for (const player of sortedAvailable) {
    if (team.canDraft(player.position)) {
      return { [player.index]: 1.0 };
    }
  }

  return {};
}

/**
 * Calculate player hazards for multiple upcoming picks
 * Port of multi_pick_player_hazards() from demand.py
 */
export function getMultiPickPlayerHazards(
  players: Map<number, Player>,
  draftState: DraftState,
  availableIndices: number[],
  horizon: number,
  options: { N?: number; eta?: number } = {}
): Record<number, number>[] {
  const { N = 10, eta = 0.4 } = options;
  const hazards: Record<number, number>[] = [];

  for (let step = 0; step < horizon; step++) {
    const owner = draftState.pickOwner(draftState.currentPick + step);
    const team = draftState.teams[owner];
    
    // Grow the visible window a bit the farther out we are
    const NStep = N + Math.max(0, Math.floor(step / 6)); // +1 every ~6 picks

    const probs = getEspnPickProbsForTeam(players, availableIndices, team, {
      N: NStep,
      eta: eta
    });

    hazards.push(probs);
  }

  return hazards;
}

/**
 * Calculate expected position drain from player hazards
 * Port of expected_position_drain_from_hazards() from demand.py
 */
export function getExpectedPositionDrain(
  hazards: Record<number, number>[],
  players: Map<number, Player>
): Record<Position, number> {
  const drain: Partial<Record<Position, number>> = {};

  for (const pickProbs of hazards) {
    for (const [idx, prob] of Object.entries(pickProbs)) {
      const player = players.get(Number(idx));
      if (player) {
        const pos = player.position;
        drain[pos] = (drain[pos] || 0) + prob;
      }
    }
  }

  return drain as Record<Position, number>;
}

/**
 * Calculate survival probabilities for players
 * Port of survival_probs() from demand.py
 */
export function getSurvivalProbabilities(
  hazards: Record<number, number>[],
  playerIndices: number[]
): Record<number, number> {
  const survival: Record<number, number> = {};
  
  // Initialize all players with 100% survival
  for (const idx of playerIndices) {
    survival[idx] = 1.0;
  }

  // Apply hazard from each pick
  for (const pickProbs of hazards) {
    for (const idx of playerIndices) {
      const hazard = pickProbs[idx] || 0.0;
      survival[idx] *= (1.0 - hazard);
    }
  }

  return survival;
}

/**
 * One-shot forecast package: hazards + position drains
 * Port of forecast_until_next_pick_esbn() from demand.py
 */
export function forecastUntilNextPickEsbn(
  players: Map<number, Player>,
  draftState: DraftState,
  availableIndices: number[],
  horizon: number,
  options: { N?: number; eta?: number } = {}
): {
  hazards: Record<number, number>[];
  expectedDrain: Record<Position, number>;
} {
  const hazards = getMultiPickPlayerHazards(
    players, 
    draftState, 
    availableIndices, 
    horizon, 
    options
  );

  const expectedDrain = getExpectedPositionDrain(hazards, players);

  return { hazards, expectedDrain };
}

/**
 * Autopick using ESPN hazards (get most likely pick)
 * Port of autopick_index_from_hazard() from demand.py
 */
export function getAutopickFromHazard(
  hazard: Record<number, number>,
  players: Map<number, Player>,
  team: Team
): number | null {
  if (Object.keys(hazard).length === 0) {
    return null;
  }

  // Keep only legal picks
  const legalPicks: [number, number][] = [];
  for (const [idx, prob] of Object.entries(hazard)) {
    const player = players.get(Number(idx));
    if (player && team.canDraft(player.position)) {
      legalPicks.push([Number(idx), prob]);
    }
  }

  if (legalPicks.length === 0) {
    return null;
  }

  // Return player with highest probability
  legalPicks.sort((a, b) => b[1] - a[1]);
  return legalPicks[0][0];
}

/**
 * Predict current pick using mixed probabilities
 * Port of predict_current_pick() from draft.py
 */
export function predictCurrentPick(
  players: Map<number, Player>,
  draftState: DraftState,
  availableIndices: number[]
): {
  predictedIndex: number | null;
  probabilities: Record<number, number>;
} {
  const owner = draftState.pickOwner(draftState.currentPick);
  const team = draftState.teams[owner];

  const probs = getEspnPickProbsForTeam(players, availableIndices, team);
  
  if (Object.keys(probs).length === 0) {
    return { predictedIndex: null, probabilities: {} };
  }

  // Simple selection: weighted random choice (or most likely for deterministic)
  // For now, return most likely pick
  const sortedProbs = Object.entries(probs)
    .sort(([, a], [, b]) => b - a);

  const predictedIndex = sortedProbs.length > 0 ? Number(sortedProbs[0][0]) : null;

  return { predictedIndex, probabilities: probs };
}

/**
 * Get best available indices by position for survival calculations
 * Port of best_ix_by_pos_now() from var.py
 */
export function getBestIndexByPositionNow(
  positionLists: { [K in Position]: number[] },
  availableIndices: number[]
): Partial<Record<Position, number>> {
  const availableSet = new Set(availableIndices);
  const result: Partial<Record<Position, number>> = {};

  for (const [pos, playerList] of Object.entries(positionLists) as Array<[Position, number[]]>) {
    const bestIndex = playerList.find(idx => availableSet.has(idx));
    if (bestIndex !== undefined) {
      result[pos] = bestIndex;
    }
  }

  return result;
}
