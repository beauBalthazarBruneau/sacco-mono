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

// Auth helper functions
export const signInWithMagicLink = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
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
