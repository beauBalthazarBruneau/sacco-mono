/**
 * Database query functions for fantasy draft algorithm
 * Maps Python draft.py operations to Supabase queries
 */

import { createClient } from '@supabase/supabase-js';
import {
  Player,
  DraftSession,
  DraftPick,
  DraftState,
  TeamRoster,
  PositionNeeds,
  PositionLists,
  ReplacementLevels,
  DraftSettings,
  PlayerSearchResult,
  DraftStateQueryResult,
  POSITIONS,
  VALID_POSITIONS,
  FLEX_ELIGIBLE,
  LINEUP_REQUIREMENTS
} from '../types/database.js';

// Supabase client - will be initialized from environment variables
let supabase: ReturnType<typeof createClient>;

export function initializeDatabase(supabaseUrl: string, supabaseKey: string) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * PLAYER DATA QUERIES
 * Equivalent to load_players() and related functions in draft.py
 */

/**
 * Get all available players for draft recommendations
 * Equivalent to: df[df['position'].isin(VALID_POS)]
 */
export async function getAvailablePlayers(draftSessionId: string): Promise<Player[]> {
  // Get taken players for this draft
  const { data: takenPicks } = await supabase
    .from('draft_picks')
    .select('player_name')
    .eq('draft_session_id', draftSessionId);

  const takenPlayerNames = new Set(takenPicks?.map(p => p.player_name) || []);

  // Get all players not yet taken
  const { data: players, error } = await supabase
    .from('player_rankings')
    .select('id, player_name, position, team, ppr_points_per_game, adp')
    .in('position', POSITIONS)
    .not('ppr_points_per_game', 'is', null)
    .order('ppr_points_per_game', { ascending: false });

  if (error) throw error;

  return (players || [])
    .filter(p => !takenPlayerNames.has(p.player_name))
    .map(p => ({
      id: p.id,
      player_name: p.player_name,
      position: p.position as any,
      team: p.team,
      ppg: p.ppr_points_per_game || 0,
      adp: p.adp,
      global_rank: p.adp ? Math.floor(p.adp) : undefined
    }));
}

/**
 * Search players by name or position
 * Equivalent to: df[df['player_name'].str.contains(query)]
 */
export async function searchPlayers(query: string, limit: number = 50): Promise<PlayerSearchResult> {
  const { data: players, error, count } = await supabase
    .from('player_rankings')
    .select('id, player_name, position, team, ppr_points_per_game, adp', { count: 'exact' })
    .or(`player_name.ilike.%${query}%,position.ilike.%${query}%`)
    .in('position', POSITIONS)
    .not('ppr_points_per_game', 'is', null)
    .order('ppr_points_per_game', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return {
    players: (players || []).map(p => ({
      id: p.id,
      player_name: p.player_name,
      position: p.position as any,
      team: p.team,
      ppg: p.ppr_points_per_game || 0,
      adp: p.adp
    })),
    totalCount: count || 0
  };
}

/**
 * Get player by ID or name
 */
export async function getPlayer(identifier: string): Promise<Player | null> {
  let query = supabase
    .from('player_rankings')
    .select('id, player_name, position, team, ppr_points_per_game, adp');

  // Check if identifier is UUID format
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  
  if (isUUID) {
    query = query.eq('id', identifier);
  } else {
    query = query.eq('player_name', identifier);
  }

  const { data, error } = await query.single();

  if (error) return null;

  return {
    id: data.id,
    player_name: data.player_name,
    position: data.position as any,
    team: data.team,
    ppg: data.ppr_points_per_game || 0,
    adp: data.adp
  };
}

/**
 * DRAFT STATE QUERIES
 * Equivalent to DraftState class operations in draft.py
 */

/**
 * Create new draft session
 */
export async function createDraftSession(
  userId: string, 
  leagueName: string,
  platform: string,
  settings: DraftSettings
): Promise<string> {
  const { data, error } = await supabase
    .from('draft_sessions')
    .insert({
      user_id: userId,
      league_name: leagueName,
      platform: platform,
      team_count: settings.teamCount,
      draft_position: settings.draftPosition,
      status: 'active',
      settings: {
        rounds: settings.rounds,
        leagueType: settings.leagueType,
        preferredStrategy: settings.preferredStrategy,
        autoPickEnabled: settings.autoPickEnabled
      }
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Get complete draft state
 * Equivalent to reconstructing DraftState from database
 */
export async function getDraftState(draftSessionId: string): Promise<DraftStateQueryResult> {
  // Get draft session
  const { data: session, error: sessionError } = await supabase
    .from('draft_sessions')
    .select('*')
    .eq('id', draftSessionId)
    .single();

  if (sessionError) throw sessionError;

  // Get all picks for this session
  const { data: picks, error: picksError } = await supabase
    .from('draft_picks')
    .select('*')
    .eq('draft_session_id', draftSessionId)
    .order('pick_number');

  if (picksError) throw picksError;

  // Get available players
  const availablePlayers = await getAvailablePlayers(draftSessionId);

  // Calculate team rosters
  const teamRosters = calculateTeamRosters(session.team_count, picks || []);

  return {
    session,
    picks: picks || [],
    availablePlayers,
    teamRosters
  };
}

/**
 * Record a draft pick
 */
export async function recordPick(
  draftSessionId: string,
  pickNumber: number,
  round: number,
  playerName: string,
  position: string,
  team: string | null,
  recommended: boolean = false,
  recommendationReason: string | null = null
): Promise<void> {
  const { error } = await supabase
    .from('draft_picks')
    .insert({
      draft_session_id: draftSessionId,
      pick_number: pickNumber,
      round: round,
      player_name: playerName,
      position: position as any,
      team: team,
      recommended: recommended,
      recommendation_reason: recommendationReason
    });

  if (error) throw error;
}

/**
 * Get draft picks for session
 */
export async function getDraftPicks(draftSessionId: string): Promise<DraftPick[]> {
  const { data, error } = await supabase
    .from('draft_picks')
    .select('*')
    .eq('draft_session_id', draftSessionId)
    .order('pick_number');

  if (error) throw error;
  return data || [];
}

/**
 * ALGORITHM SUPPORT QUERIES
 * Support functions for DAVAR calculations and recommendations
 */

/**
 * Get players grouped by position for algorithm calculations
 * Equivalent to: positional_lists(df)
 */
export async function getPlayersByPosition(
  availableOnly: boolean = true,
  draftSessionId?: string
): Promise<PositionLists> {
  let players: Player[];
  
  if (availableOnly && draftSessionId) {
    players = await getAvailablePlayers(draftSessionId);
  } else {
    const { data, error } = await supabase
      .from('player_rankings')
      .select('id, player_name, position, team, ppr_points_per_game, adp')
      .in('position', POSITIONS)
      .not('ppr_points_per_game', 'is', null)
      .order('ppr_points_per_game', { ascending: false });

    if (error) throw error;
    
    players = (data || []).map(p => ({
      id: p.id,
      player_name: p.player_name,
      position: p.position as any,
      team: p.team,
      ppg: p.ppr_points_per_game || 0,
      adp: p.adp
    }));
  }

  const positionLists: PositionLists = {
    QB: [],
    RB: [],
    WR: [],
    TE: []
  };

  players.forEach(player => {
    if (player.position in positionLists) {
      positionLists[player.position as keyof PositionLists].push(player.id);
    }
  });

  return positionLists;
}

/**
 * Calculate replacement level players for DAVAR algorithm
 * Equivalent to: league_replacement_indices() and replacement_ppg_by_pos()
 */
export async function getReplacementPlayers(
  leagueSize: number,
  draftSessionId?: string
): Promise<ReplacementLevels> {
  const players = draftSessionId ? 
    await getAvailablePlayers(draftSessionId) : 
    await getAllPlayers();

  // Group players by position, sorted by PPG
  const playersByPos: Record<string, Player[]> = {};
  POSITIONS.forEach(pos => playersByPos[pos] = []);

  players.forEach(player => {
    if (player.position in playersByPos) {
      playersByPos[player.position].push(player);
    }
  });

  // Sort by PPG descending
  Object.values(playersByPos).forEach(posPlayers => {
    posPlayers.sort((a, b) => b.ppg - a.ppg);
  });

  // Calculate replacement indices (starter + flex share)
  const flexShare = LINEUP_REQUIREMENTS.FLEX / 3.0;
  
  return {
    QB: Math.floor(leagueSize * LINEUP_REQUIREMENTS.QB),
    RB: Math.floor(leagueSize * LINEUP_REQUIREMENTS.RB + leagueSize * flexShare),
    WR: Math.floor(leagueSize * LINEUP_REQUIREMENTS.WR + leagueSize * flexShare), 
    TE: Math.floor(leagueSize * LINEUP_REQUIREMENTS.TE + leagueSize * flexShare)
  };
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Get all players (not filtered by draft)
 */
async function getAllPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('player_rankings')
    .select('id, player_name, position, team, ppr_points_per_game, adp')
    .in('position', POSITIONS)
    .not('ppr_points_per_game', 'is', null)
    .order('ppr_points_per_game', { ascending: false });

  if (error) throw error;

  return (data || []).map(p => ({
    id: p.id,
    player_name: p.player_name,
    position: p.position as any,
    team: p.team,
    ppg: p.ppr_points_per_game || 0,
    adp: p.adp
  }));
}

/**
 * Calculate team rosters from draft picks
 * Equivalent to Team class in models.py
 */
function calculateTeamRosters(teamCount: number, picks: DraftPick[]): TeamRoster[] {
  const rosters: TeamRoster[] = [];
  
  // Initialize empty rosters
  for (let i = 0; i < teamCount; i++) {
    rosters.push({
      teamIndex: i,
      picks: [],
      needs: { ...LINEUP_REQUIREMENTS }
    });
  }

  // Process picks and update rosters
  picks.forEach(pick => {
    const teamIndex = calculatePickOwner(pick.pick_number, teamCount);
    const roster = rosters[teamIndex];
    
    roster.picks.push(pick.player_name);
    
    // Update position needs
    const pos = pick.position;
    if (roster.needs[pos] > 0) {
      roster.needs[pos]--;
    } else if (FLEX_ELIGIBLE.has(pos) && roster.needs.FLEX > 0) {
      roster.needs.FLEX--;
    }
  });

  return rosters;
}

/**
 * Calculate which team owns a specific pick number
 * Equivalent to: draft.pick_owner() in draft.py
 */
export function calculatePickOwner(pickNumber: number, teamCount: number): number {
  const round = Math.ceil(pickNumber / teamCount);
  const indexInRound = (pickNumber - 1) % teamCount;
  
  // Snake draft logic
  return (round % 2 === 0) ? 
    (teamCount - 1 - indexInRound) : 
    indexInRound;
}

/**
 * Calculate current pick number from draft state
 */
export function getCurrentPickNumber(picks: DraftPick[]): number {
  return picks.length + 1;
}

/**
 * Check if draft is complete
 */
export function isDraftComplete(picks: DraftPick[], teamCount: number, rounds: number): boolean {
  return picks.length >= (teamCount * rounds);
}
