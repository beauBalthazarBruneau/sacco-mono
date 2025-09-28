import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sjmljrgabepxdfhefyxo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Only create the client if we have a valid key
let supabase: ReturnType<typeof createClient<Database>> | null = null

if (supabaseAnonKey && supabaseAnonKey !== '') {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
} else {
  console.warn('Supabase not configured - authentication features will be disabled')
}

export { supabase }

// Auth helper functions
export const signInWithMagicLink = async (email: string) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export const signOut = async () => {
  if (!supabase) {
    return { error: { message: 'Supabase not configured' } }
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (!supabase) {
    return { user: null, error: { message: 'Supabase not configured' } }
  }
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Basketball Player data types (matching actual database schema)
export interface Player {
  id: string
  player_name: string
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL' | null
  team: string | null
  adp: number | null
  categories_points: number | null
  points_league_points: number | null
  categories_rank: number | null
  points_rank: number | null
  projected_points: number | null
  projected_rebounds: number | null
  projected_assists: number | null
  projected_steals: number | null
  projected_blocks: number | null
  last_updated: string | null
  // Fantasy points for different scoring systems
  ppr_points: number | null
  standard_points: number | null
  half_ppr_points: number | null
}

export interface PlayersResponse {
  data: Player[]
  count: number
  error: string | null
}

// Player data service functions
export const getPlayers = async (
  page: number = 0,
  limit: number = 25,
  search?: string,
  position?: string,
  sortBy: 'adp' | 'categories_points' | 'points_league_points' | 'categories_rank' | 'points_rank' = 'adp',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<PlayersResponse> => {
  if (!supabase) {
    return { data: [], count: 0, error: 'Supabase not configured' }
  }

  try {
    let query = supabase
      .from('player_rankings')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search && search.trim()) {
      query = query.ilike('player_name', `%${search.trim()}%`)
    }

    // Apply position filter
    if (position && position !== 'ALL') {
      const validPositions: Array<'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL'> = ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL']
      if (validPositions.includes(position as any)) {
        query = query.eq('position', position as 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL')
      }
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = page * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching players:', error)
      return { data: [], count: 0, error: error.message }
    }

    // Add default values for missing fantasy points fields
    const playersWithDefaults = (data || []).map(player => ({
      ...player,
      ppr_points: null,
      standard_points: null,
      half_ppr_points: null
    }))

    return { data: playersWithDefaults, count: count || 0, error: null }
  } catch (err) {
    console.error('Unexpected error fetching players:', err)
    return { data: [], count: 0, error: 'Unexpected error occurred' }
  }
}

// Use database types directly
export type DraftSession = {
  id: string
  user_id: string
  league_name: string
  platform: string
  draft_date: string | null
  team_count: number
  draft_position: number
  status: 'active' | 'completed' | 'cancelled' | null
  settings: any | null
  created_at: string | null
  updated_at: string | null
}

export interface DraftSessionsResponse {
  data: DraftSession[]
  count: number
  error: string | null
}

// Draft sessions service functions
export const getDraftSessions = async (
  userId: string,
  limit: number = 50
): Promise<DraftSessionsResponse> => {
  if (!supabase) {
    return { data: [], count: 0, error: 'Supabase not configured' }
  }

  try {
    const { data, error, count } = await supabase
      .from('draft_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching draft sessions:', error)
      return { data: [], count: 0, error: error.message }
    }

    return { data: data || [], count: count || 0, error: null }
  } catch (err) {
    console.error('Unexpected error fetching draft sessions:', err)
    return { data: [], count: 0, error: 'Unexpected error occurred' }
  }
}

// Ensure user profile exists
export const ensureUserProfile = async (user: any) => {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  try {
    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating user profile:', error)
        throw error
      }
    }
  } catch (err) {
    console.error('Error ensuring user profile:', err)
    throw err
  }
}

export const createDraftSession = async (sessionData: Database['public']['Tables']['draft_sessions']['Insert']) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  try {
    console.log('Supabase creating draft session with:', sessionData)
    const { data, error } = await supabase
      .from('draft_sessions')
      .insert(sessionData)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error creating draft session:', err)
    return { data: null, error: { message: 'Failed to create draft session' } }
  }
}

// Get single draft session by ID
export const getDraftSession = async (sessionId: string) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  try {
    const { data, error } = await supabase
      .from('draft_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error fetching draft session:', err)
    return { data: null, error: { message: 'Failed to fetch draft session' } }
  }
}

// Draft Picks types and functions
export type DraftPick = Database['public']['Tables']['draft_picks']['Row']

export interface DraftPicksResponse {
  data: DraftPick[]
  count: number
  error: string | null
}

// Get all draft picks for a session
export const getDraftPicks = async (sessionId: string): Promise<DraftPicksResponse> => {
  if (!supabase) {
    return { data: [], count: 0, error: 'Supabase not configured' }
  }

  try {
    const { data, error, count } = await supabase
      .from('draft_picks')
      .select('*', { count: 'exact' })
      .eq('draft_session_id', sessionId)
      .order('pick_number', { ascending: true })

    if (error) {
      console.error('Error fetching draft picks:', error)
      return { data: [], count: 0, error: error.message }
    }

    return { data: data || [], count: count || 0, error: null }
  } catch (err) {
    console.error('Unexpected error fetching draft picks:', err)
    return { data: [], count: 0, error: 'Unexpected error occurred' }
  }
}

// Get draft picks for a specific user in a session
export const getUserDraftPicks = async (sessionId: string, _userId: string): Promise<DraftPicksResponse> => {
  if (!supabase) {
    return { data: [], count: 0, error: 'Supabase not configured' }
  }

  try {
    // For now, we'll identify user picks by comparing team with draft position
    // This is simplified - in a real app you might have a user_id field on draft_picks
    const { data, error, count } = await supabase
      .from('draft_picks')
      .select('*', { count: 'exact' })
      .eq('draft_session_id', sessionId)
      .order('pick_number', { ascending: true })

    if (error) {
      console.error('Error fetching user draft picks:', error)
      return { data: [], count: 0, error: error.message }
    }

    return { data: data || [], count: count || 0, error: null }
  } catch (err) {
    console.error('Unexpected error fetching user draft picks:', err)
    return { data: [], count: 0, error: 'Unexpected error occurred' }
  }
}

// Create a new draft pick
export const createDraftPick = async (pickData: Database['public']['Tables']['draft_picks']['Insert']) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } }
  }

  try {
    const { data, error } = await supabase
      .from('draft_picks')
      .insert(pickData)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error creating draft pick:', err)
    return { data: null, error: { message: 'Failed to create draft pick' } }
  }
}
