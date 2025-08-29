/**
 * TypeScript port of DAVAR scoring algorithm
 * Ports var.py DAVAR calculations and value-above-replacement logic
 */

import { Player, Position, PositionLists, POSITIONS } from './models.js';

/**
 * VAR-based, survival-aware DAVAR scoring
 * Port of davar_esbn() from var.py
 * 
 * Formula:
 *   base = VAR_now = PPG(player) - replacement_ppg[pos]
 *   delta_pos = (1-survival) * max(0, PPG(player) - E_best_next[pos])
 *   hedge_loss = max_over_other_pos(max(0, best_now[pos'] - E_best_next[pos']))
 *   score = base + alpha*delta_pos - beta*hedge_loss - risk_penalty
 */
export function calculateDavarEsbn(
  player: Player,
  bestNowByPosition: Record<Position, number>,
  expectedBestNextByPosition: Record<Position, number>,
  replacementPpgByPosition: Record<Position, number>,
  survivalForCandidate: number,
  options: {
    alpha?: number;       // weight on position-wait cost
    beta?: number;        // weight on cross-position hedge loss
    riskPenalty?: number; // additional risk adjustment
  } = {}
): number {
  const { alpha = 0.9, beta = 0.8, riskPenalty = 0.0 } = options;

  const ppg = player.ppg;
  const pos = player.position;
  const survival = survivalForCandidate;

  // VAR baseline: player's PPG minus replacement level at their position
  const replacementPpg = replacementPpgByPosition[pos] || 0.0;
  const base = ppg - replacementPpg;

  // Cost of waiting at candidate's position
  const expectedBestNext = expectedBestNextByPosition[pos] || 0.0;
  const dropVsNext = Math.max(0.0, ppg - expectedBestNext);
  const deltaPos = (1.0 - survival) * dropVsNext;

  // Cross-position hedge (loss if you skip another position now)
  const hedgeCandidates: number[] = [];
  
  for (const otherPos of POSITIONS) {
    if (otherPos === pos) continue; // Skip candidate's own position
    
    const bestNow = bestNowByPosition[otherPos] || 0.0;
    const bestNext = expectedBestNextByPosition[otherPos] || 0.0;
    const loss = Math.max(0.0, bestNow - bestNext);
    hedgeCandidates.push(loss);
  }

  const hedgeLoss = hedgeCandidates.length > 0 ? Math.max(...hedgeCandidates) : 0.0;

  // Final DAVAR score
  return base + alpha * deltaPos - beta * hedgeLoss - riskPenalty;
}

/**
 * Advanced DAVAR with deficit weighting and capacity constraints
 * This is a more sophisticated version that could be used for enhanced scoring
 */
export function calculateAdvancedDavar(
  player: Player,
  bestNowByPosition: Record<Position, number>,
  expectedBestNextByPosition: Record<Position, number>,
  replacementPpgByPosition: Record<Position, number>,
  survivalBestByPosition: Record<Position, number>,
  survivalForCandidate: number,
  options: {
    accruedVarByPosition?: Record<Position, number>;
    remainingVarBudgetByPosition?: Record<Position, number>;
    capLeftByPosition?: Record<Position, number>;
    ownedCountByPosition?: Record<Position, number>;
    alpha?: number;
    beta?: number;
    rhoOverfill?: number;  // penalty for exceeding position capacity
    phiDeficit?: number;   // penalty for deficit in key positions
  } = {}
): number {
  const {
    accruedVarByPosition = {},
    remainingVarBudgetByPosition = {},
    capLeftByPosition = {},
    ownedCountByPosition = {},
    alpha = 0.9,
    beta = 0.7,
    rhoOverfill = 1.0,
    phiDeficit = 1.0
  } = options;

  // Base DAVAR calculation
  const baseDavar = calculateDavarEsbn(
    player,
    bestNowByPosition,
    expectedBestNextByPosition,
    replacementPpgByPosition,
    survivalForCandidate,
    { alpha, beta }
  );

  const pos = player.position;

  // Capacity constraint adjustments
  let capacityAdjustment = 0.0;
  const capLeft = capLeftByPosition[pos] || 0.0;
  const owned = ownedCountByPosition[pos] || 0;

  // Overfill penalty if exceeding reasonable capacity
  if (capLeft <= 0 && owned > 0) {
    capacityAdjustment -= rhoOverfill * 2.0; // Strong penalty for overfilling
  }

  // Deficit consideration - boost positions that are under-represented
  let deficitBoost = 0.0;
  const remainingBudget = remainingVarBudgetByPosition[pos] || 0.0;
  if (remainingBudget > 0 && capLeft > 0) {
    // Small boost for positions where we still have capacity and need value
    deficitBoost = phiDeficit * Math.min(1.0, remainingBudget / 5.0);
  }

  return baseDavar + capacityAdjustment + deficitBoost;
}

/**
 * Calculate opportunity cost for a position
 * The difference between current best and expected best next at that position
 */
export function calculateOpportunityCost(
  position: Position,
  bestNowByPosition: Record<Position, number>,
  expectedBestNextByPosition: Record<Position, number>
): number {
  const bestNow = bestNowByPosition[position] || 0.0;
  const bestNext = expectedBestNextByPosition[position] || 0.0;
  return Math.max(0.0, bestNow - bestNext);
}

/**
 * Calculate all opportunity costs by position
 * Used for cross-position analysis in recommendations
 */
export function calculateAllOpportunityCosts(
  bestNowByPosition: Record<Position, number>,
  expectedBestNextByPosition: Record<Position, number>
): Record<Position, number> {
  const costs: Partial<Record<Position, number>> = {};
  
  for (const pos of POSITIONS) {
    costs[pos] = calculateOpportunityCost(
      pos,
      bestNowByPosition,
      expectedBestNextByPosition
    );
  }
  
  return costs as Record<Position, number>;
}

/**
 * Score a batch of players using DAVAR
 * Optimized for recommendation generation
 */
export interface ScoringContext {
  bestNowByPosition: Record<Position, number>;
  expectedBestNextByPosition: Record<Position, number>;
  replacementPpgByPosition: Record<Position, number>;
  survivalProbabilities: Record<number, number>;
  options?: {
    alpha?: number;
    beta?: number;
    riskPenalty?: number;
  };
}

export function scorePlayersWithDavar(
  players: Player[],
  context: ScoringContext
): Array<{
  player: Player;
  davarScore: number;
  opportunityCost: number;
  survivalProbability: number;
}> {
  const results = players.map(player => {
    const survival = context.survivalProbabilities[player.index] || 1.0;
    
    const davarScore = calculateDavarEsbn(
      player,
      context.bestNowByPosition,
      context.expectedBestNextByPosition,
      context.replacementPpgByPosition,
      survival,
      context.options
    );

    const opportunityCost = calculateOpportunityCost(
      player.position,
      context.bestNowByPosition,
      context.expectedBestNextByPosition
    );

    return {
      player,
      davarScore,
      opportunityCost,
      survivalProbability: survival
    };
  });

  // Sort by DAVAR score descending
  return results.sort((a, b) => b.davarScore - a.davarScore);
}

/**
 * Simple VAR (Value Above Replacement) calculation
 * Base component of DAVAR without survival adjustments
 */
export function calculateSimpleVar(
  playerPpg: number,
  position: Position,
  replacementPpgByPosition: Record<Position, number>
): number {
  const replacementPpg = replacementPpgByPosition[position] || 0.0;
  return Math.max(0.0, playerPpg - replacementPpg);
}

/**
 * Tier-based value calculation
 * Alternative scoring method for tier-based drafting
 */
export function calculateTierValue(
  player: Player,
  positionLists: PositionLists,
  availableIndices: number[],
  players: Map<number, Player>
): number {
  const availableSet = new Set(availableIndices);
  const positionPlayers = positionLists[player.position]
    .filter(idx => availableSet.has(idx))
    .map(idx => players.get(idx)!)
    .filter(p => p !== undefined)
    .sort((a, b) => b.ppg - a.ppg);

  if (positionPlayers.length === 0) return 0.0;

  // Find player's rank within their position
  const playerRank = positionPlayers.findIndex(p => p.index === player.index);
  if (playerRank === -1) return 0.0;

  // Tier boundaries (example: top 12, 13-24, 25+)
  const tier1Cutoff = 12;
  const tier2Cutoff = 24;

  if (playerRank < tier1Cutoff) {
    return 3.0; // Tier 1 value
  } else if (playerRank < tier2Cutoff) {
    return 2.0; // Tier 2 value
  } else {
    return 1.0; // Tier 3+ value
  }
}

/**
 * Calculate positional scarcity multiplier
 * Accounts for how quickly a position is being depleted
 */
export function calculateScarcityMultiplier(
  position: Position,
  positionLists: PositionLists,
  availableIndices: number[],
  expectedDrain: Record<Position, number>
): number {
  const availableAtPosition = positionLists[position]
    .filter(idx => availableIndices.includes(idx)).length;
  
  if (availableAtPosition === 0) return 0.0;

  const drainRate = expectedDrain[position] || 0.0;
  const scarcityRatio = drainRate / Math.max(1, availableAtPosition);

  // Higher scarcity ratio = higher multiplier
  return 1.0 + Math.min(1.0, scarcityRatio);
}
