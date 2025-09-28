// backend-api/scripts/basketball/basketball_scoring.ts
// Basketball fantasy scoring calculations

export interface BasketballStats {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  field_goals_made: number;
  field_goals_attempted: number;
  three_pointers_made: number;
  three_pointers_attempted: number;
  free_throws_made: number;
  free_throws_attempted: number;
  minutes: number;
  games: number;
}

export interface PointsLeagueSettings {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number; // Usually negative
  field_goals_made: number;
  field_goals_missed: number; // Usually negative
  three_pointers_made: number;
  free_throws_made: number;
  free_throws_missed: number; // Usually negative
  double_double: number;
  triple_double: number;
}

// Common fantasy basketball points league settings
export const STANDARD_POINTS_SETTINGS: PointsLeagueSettings = {
  points: 1.0,
  rebounds: 1.2,
  assists: 1.5,
  steals: 3.0,
  blocks: 3.0,
  turnovers: -1.0,
  field_goals_made: 0.5,
  field_goals_missed: -0.5,
  three_pointers_made: 0.5, // Bonus for 3PM
  free_throws_made: 0.5,
  free_throws_missed: -0.5,
  double_double: 1.5,
  triple_double: 3.0
};

export const CONSERVATIVE_POINTS_SETTINGS: PointsLeagueSettings = {
  points: 1.0,
  rebounds: 1.0,
  assists: 1.0,
  steals: 2.0,
  blocks: 2.0,
  turnovers: -1.0,
  field_goals_made: 0.0,
  field_goals_missed: 0.0,
  three_pointers_made: 0.0,
  free_throws_made: 0.0,
  free_throws_missed: 0.0,
  double_double: 0.0,
  triple_double: 0.0
};

export const AGGRESSIVE_POINTS_SETTINGS: PointsLeagueSettings = {
  points: 1.0,
  rebounds: 1.5,
  assists: 2.0,
  steals: 4.0,
  blocks: 4.0,
  turnovers: -2.0,
  field_goals_made: 1.0,
  field_goals_missed: -1.0,
  three_pointers_made: 1.0,
  free_throws_made: 0.5,
  free_throws_missed: -0.5,
  double_double: 2.0,
  triple_double: 5.0
};

/**
 * Calculate fantasy points for a points league
 */
export function calculatePointsLeagueScore(stats: Partial<BasketballStats>, settings: PointsLeagueSettings = STANDARD_POINTS_SETTINGS): number {
  let points = 0;

  // Basic stats
  points += (stats.points || 0) * settings.points;
  points += (stats.rebounds || 0) * settings.rebounds;
  points += (stats.assists || 0) * settings.assists;
  points += (stats.steals || 0) * settings.steals;
  points += (stats.blocks || 0) * settings.blocks;
  points += (stats.turnovers || 0) * settings.turnovers; // Usually negative

  // Shooting stats
  points += (stats.field_goals_made || 0) * settings.field_goals_made;

  const fgMissed = (stats.field_goals_attempted || 0) - (stats.field_goals_made || 0);
  points += fgMissed * settings.field_goals_missed;

  points += (stats.three_pointers_made || 0) * settings.three_pointers_made;
  points += (stats.free_throws_made || 0) * settings.free_throws_made;

  const ftMissed = (stats.free_throws_attempted || 0) - (stats.free_throws_made || 0);
  points += ftMissed * settings.free_throws_missed;

  // Double/Triple doubles (would need to be calculated from game logs)
  // For projections, we can estimate based on averages
  const doubleDoubles = estimateDoubleDoubles(stats);
  const tripleDoubles = estimateTripleDoubles(stats);

  points += doubleDoubles * settings.double_double;
  points += tripleDoubles * settings.triple_double;

  return Math.round(points * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate category league rankings (used for roto/head-to-head categories)
 * Returns normalized z-scores for each category
 */
export function calculateCategoryScores(stats: Partial<BasketballStats>) {
  return {
    points: stats.points || 0,
    rebounds: stats.rebounds || 0,
    assists: stats.assists || 0,
    steals: stats.steals || 0,
    blocks: stats.blocks || 0,
    turnovers: -(stats.turnovers || 0), // Invert so lower is better becomes higher is better
    field_goal_percentage: calculatePercentage(stats.field_goals_made, stats.field_goals_attempted),
    free_throw_percentage: calculatePercentage(stats.free_throws_made, stats.free_throws_attempted),
    three_pointers_made: stats.three_pointers_made || 0,
  };
}

/**
 * Estimate double doubles per game based on stats
 */
function estimateDoubleDoubles(stats: Partial<BasketballStats>): number {
  if (!stats.games || stats.games === 0) return 0;

  const categories = [
    stats.points || 0,
    stats.rebounds || 0,
    stats.assists || 0,
    stats.steals || 0,
    stats.blocks || 0
  ];

  // Simple heuristic: if player averages 10+ in 2+ categories, they likely get double doubles
  const doubleDigitCategories = categories.filter(cat => cat >= 10).length;

  if (doubleDigitCategories >= 3) return stats.games * 0.8; // 80% of games
  if (doubleDigitCategories >= 2) return stats.games * 0.6; // 60% of games
  if (doubleDigitCategories >= 1) return stats.games * 0.2; // 20% of games
  return 0;
}

/**
 * Estimate triple doubles per game based on stats
 */
function estimateTripleDoubles(stats: Partial<BasketballStats>): number {
  if (!stats.games || stats.games === 0) return 0;

  const categories = [
    stats.points || 0,
    stats.rebounds || 0,
    stats.assists || 0,
    stats.steals || 0,
    stats.blocks || 0
  ];

  // Very conservative: need to average close to 10 in at least 3 categories
  const nearDoubleDigitCategories = categories.filter(cat => cat >= 8).length;

  if (nearDoubleDigitCategories >= 3) return stats.games * 0.15; // 15% of games
  return 0;
}

/**
 * Calculate shooting percentage
 */
function calculatePercentage(made: number | undefined, attempted: number | undefined): number {
  if (!attempted || attempted === 0) return 0;
  return ((made || 0) / attempted) * 100;
}

/**
 * Calculate per-game averages
 */
export function calculatePerGameStats(stats: BasketballStats): BasketballStats {
  if (!stats.games || stats.games === 0) return stats;

  return {
    ...stats,
    points: stats.points / stats.games,
    rebounds: stats.rebounds / stats.games,
    assists: stats.assists / stats.games,
    steals: stats.steals / stats.games,
    blocks: stats.blocks / stats.games,
    turnovers: stats.turnovers / stats.games,
    field_goals_made: stats.field_goals_made / stats.games,
    field_goals_attempted: stats.field_goals_attempted / stats.games,
    three_pointers_made: stats.three_pointers_made / stats.games,
    three_pointers_attempted: stats.three_pointers_attempted / stats.games,
    free_throws_made: stats.free_throws_made / stats.games,
    free_throws_attempted: stats.free_throws_attempted / stats.games,
    minutes: stats.minutes / stats.games,
    games: 1 // Per game basis
  };
}

/**
 * Get position eligibility for player based on usage patterns
 */
export function getPositionEligibility(positionId: number | null): string[] {
  const position = NBA_POSITION_MAP[positionId || 0];

  switch (position) {
    case 'PG': return ['PG', 'G'];
    case 'SG': return ['SG', 'G'];
    case 'SF': return ['SF', 'F'];
    case 'PF': return ['PF', 'F'];
    case 'C': return ['C'];
    default: return ['UTIL'];
  }
}

// Position mappings (same as in scraper)
const NBA_POSITION_MAP: Record<number, string> = {
  1: "PG",
  2: "SG",
  3: "SF",
  4: "PF",
  5: "C",
};