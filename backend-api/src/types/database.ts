/**
 * TypeScript interfaces matching Supabase database schema
 * Generated from SA-41 Database Schema Analysis
 */

// Database Types
export type PlayerPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST';
export type LeagueType = 'PPR' | 'Standard' | 'Half-PPR' | 'Superflex';
export type DraftStrategy = 'Best Available' | 'Position Need' | 'Zero RB' | 'Hero RB' | 'Late Round QB' | 'Streaming';
export type DraftStatus = 'active' | 'completed' | 'cancelled';
export type SubscriptionTier = 'free' | 'basic' | 'premium';

// Player Rankings Table
export interface PlayerRanking {
  id: string;
  player_name: string;
  position: string;
  team: string | null;
  adp: number | null;
  ppr_points: number | null;
  standard_points: number | null;
  half_ppr_points: number | null;
  ppr_points_per_game: number | null;
  standard_points_per_game: number | null;
  half_ppr_points_per_game: number | null;
  last_updated: string | null;
}

// Draft Sessions Table
export interface DraftSession {
  id: string;
  user_id: string;
  league_name: string;
  platform: string;
  draft_date: string | null;
  team_count: number;
  draft_position: number;
  status: DraftStatus;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Draft Picks Table
export interface DraftPick {
  id: string;
  draft_session_id: string;
  round: number;
  pick_number: number;
  player_name: string;
  position: PlayerPosition;
  team: string | null;
  recommended: boolean;
  recommendation_reason: string | null;
  picked_at: string;
}

// User Profiles Table
export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
  draft_picks_used: number;
  draft_picks_limit: number;
  trial_started_at: string | null;
  stripe_customer_id: string | null;
}

// User Preferences Table
export interface UserPreferences {
  id: string;
  user_id: string;
  league_type: LeagueType;
  team_count: number | null;
  draft_position: number | null;
  preferred_strategy: DraftStrategy;
  auto_pick_enabled: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Algorithm-specific interfaces based on draft.py
export interface Player {
  id: string;
  player_name: string;
  position: PlayerPosition;
  team: string | null;
  ppg: number; // Maps to ppr_points_per_game
  adp: number | null;
  global_rank?: number;
  espn_rank?: number;
}

export interface DraftState {
  sessionId: string;
  nTeams: number;
  rounds: number;
  userTeamIndex: number;
  currentPick: number;
  teams: TeamRoster[];
  takenPlayerIds: Set<string>;
  status: DraftStatus;
}

export interface TeamRoster {
  teamIndex: number;
  picks: string[]; // Player IDs
  needs: PositionNeeds;
}

export interface PositionNeeds {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  FLEX: number;
}

export interface PositionLists {
  QB: string[];
  RB: string[];
  WR: string[];
  TE: string[];
}

export interface ReplacementLevels {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
}

export interface DraftRecommendation {
  playerId: string;
  playerName: string;
  position: PlayerPosition;
  team: string | null;
  ppg: number;
  davarScore: number;
  survivalProbability: number;
  adpValue: string;
  opportunityCost: number;
  espnBoardPosition?: number;
  recommendationReason: string;
}

export interface DraftSettings {
  teamCount: number;
  rounds: number;
  leagueType: LeagueType;
  draftPosition: number;
  preferredStrategy?: DraftStrategy;
  autoPickEnabled?: boolean;
}

// API Request/Response Types
export interface CreateDraftRequest {
  userId: string;
  leagueName: string;
  platform: string;
  settings: DraftSettings;
}

export interface CreateDraftResponse {
  draftSessionId: string;
  status: 'success' | 'error';
  message?: string;
}

export interface GetRecommendationsResponse {
  recommendations: DraftRecommendation[];
  currentPick: number;
  pickOwner: number;
  horizon: number;
  positionDrain: Record<string, number>;
  predictedPick?: {
    playerId: string;
    playerName: string;
    probability: number;
  };
}

export interface SubmitPickRequest {
  draftSessionId: string;
  playerId: string;
  pickNumber: number;
  round: number;
  teamIndex: number;
}

export interface SubmitPickResponse {
  status: 'success' | 'error';
  message?: string;
  updatedState?: {
    currentPick: number;
    nextPickOwner: number;
    isComplete: boolean;
  };
}

// Database Query Result Types
export interface PlayerSearchResult {
  players: Player[];
  totalCount: number;
}

export interface DraftStateQueryResult {
  session: DraftSession;
  picks: DraftPick[];
  availablePlayers: Player[];
  teamRosters: TeamRoster[];
}

// Constants matching draft.py
export const POSITIONS: PlayerPosition[] = ['QB', 'RB', 'WR', 'TE'];
export const VALID_POSITIONS = new Set<string>(['QB', 'RB', 'WR', 'TE']);
export const FLEX_ELIGIBLE = new Set<string>(['RB', 'WR', 'TE']);

export const LINEUP_REQUIREMENTS: PositionNeeds = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  FLEX: 1
};

// Utility type for database operations
export type DatabaseTable = 
  | 'player_rankings'
  | 'draft_sessions' 
  | 'draft_picks'
  | 'user_profiles'
  | 'user_preferences'
  | 'user_analytics'
  | 'payment_history'
  | 'player_stats';

// Error types for API responses
export interface DatabaseError {
  code: string;
  message: string;
  table?: DatabaseTable;
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface APIError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
}
