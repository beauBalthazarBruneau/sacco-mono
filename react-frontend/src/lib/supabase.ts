import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sjmljrgabepxdfhefyxo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to get correct redirect URL for environment
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname, protocol, port } = window.location
    
    // Handle localhost with port
    if (hostname === 'localhost') {
      return `${protocol}//${hostname}:${port}/auth/callback`
    }
    
    // Handle production domains
    return `${protocol}//${hostname}/auth/callback`
  }
  
  // Fallback for server-side rendering
  return import.meta.env.VITE_APP_URL ? 
    `${import.meta.env.VITE_APP_URL}/auth/callback` : 
    'http://localhost:5173/auth/callback'
}

// Auth helper functions
export const signInWithMagicLink = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getRedirectUrl(),
      shouldCreateUser: true
    }
  })
  return { data, error }
}

// New OTP (6-digit code) authentication functions
export const signInWithCode = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // Don't send email redirect for OTP codes
      emailRedirectTo: undefined
    }
  })
  return { data, error }
}

export const verifyCode = async (email: string, code: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'email'
  })
  return { data, error }
}

export const resendCode = async (email: string) => {
  // Same as signInWithCode - resends the OTP
  return await signInWithCode(email)
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Player data types
export interface Player {
  id: string
  player_name: string
  position: 'QB' | 'RB' | 'WR' | 'TE'
  team: string | null
  adp: number | null
  ppr_points: number | null
  standard_points: number | null
  half_ppr_points: number | null
  ppr_points_per_game: number | null
  standard_points_per_game: number | null
  half_ppr_points_per_game: number | null
  last_updated: string | null
}

export interface PlayersResponse {
  data: Player[]
  count: number
  error: string | null
}

// Draft session types
export type LeagueType = 'PPR' | 'Standard' | 'Half-PPR' | 'Superflex'
export type DraftStrategy = 'Best Available' | 'Position Need' | 'Zero RB' | 'Hero RB' | 'Late Round QB' | 'Streaming'
export type DraftStatus = 'active' | 'completed' | 'cancelled'
export type PlayerPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'

export interface DraftSession {
  id: string
  user_id: string
  league_name: string
  platform: string
  draft_date: string | null
  team_count: number
  draft_position: number
  status: DraftStatus
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DraftPick {
  id: string
  draft_session_id: string
  round: number
  pick_number: number
  player_name: string
  position: PlayerPosition
  team: string | null
  recommended: boolean
  recommendation_reason: string | null
  picked_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  league_type: LeagueType
  team_count: number
  draft_position: number | null
  preferred_strategy: DraftStrategy
  auto_pick_enabled: boolean
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export interface DraftSessionForm {
  league_name: string
  platform: string
  team_count: number
  draft_position: number
  draft_date?: Date
  league_type: LeagueType
  preferred_strategy: DraftStrategy
}

// Player data service functions
export const getPlayers = async (
  page: number = 0,
  limit: number = 25,
  search?: string,
  position?: string,
  sortBy: 'adp' | 'ppr_points' = 'adp',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<PlayersResponse> => {
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
      query = query.eq('position', position)
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

    return { data: data || [], count: count || 0, error: null }
  } catch (err) {
    console.error('Unexpected error fetching players:', err)
    return { data: [], count: 0, error: 'Unexpected error occurred' }
  }
}

// Draft service functions
export const createDraftSession = async (draftData: DraftSessionForm) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('draft_sessions')
      .insert({
        user_id: user.id,
        league_name: draftData.league_name,
        platform: draftData.platform,
        team_count: draftData.team_count,
        draft_position: draftData.draft_position,
        draft_date: draftData.draft_date?.toISOString() || null,
        settings: {
          league_type: draftData.league_type,
          preferred_strategy: draftData.preferred_strategy
        }
      })
      .select()
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error creating draft session:', err)
    return { data: null, error: 'Failed to create draft session' }
  }
}

export const getDraftSessions = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [], error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('draft_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return { data: data || [], error }
  } catch (err) {
    console.error('Error fetching draft sessions:', err)
    return { data: [], error: 'Failed to fetch draft sessions' }
  }
}

export const getDraftSession = async (id: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('draft_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error fetching draft session:', err)
    return { data: null, error: 'Failed to fetch draft session' }
  }
}

export const updateDraftSession = async (id: string, updates: Partial<DraftSession>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('draft_sessions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error updating draft session:', err)
    return { data: null, error: 'Failed to update draft session' }
  }
}

export const deleteDraftSession = async (id: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('draft_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    return { error }
  } catch (err) {
    console.error('Error deleting draft session:', err)
    return { error: 'Failed to delete draft session' }
  }
}

export const getUserPreferences = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error fetching user preferences:', err)
    return { data: null, error: 'Failed to fetch user preferences' }
  }
}

export const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .update(preferences)
      .eq('user_id', user.id)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error updating user preferences:', err)
    return { data: null, error: 'Failed to update user preferences' }
  }
}
