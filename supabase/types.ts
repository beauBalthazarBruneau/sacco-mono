// TypeScript types for the Fantasy Football Draft Assistant database schema
// Generated from the Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          subscription_tier: 'free' | 'basic' | 'premium'
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          subscription_tier?: 'free' | 'basic' | 'premium'
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          subscription_tier?: 'free' | 'basic' | 'premium'
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          league_type: 'PPR' | 'Standard' | 'Half-PPR' | 'Superflex'
          team_count: number
          draft_position: number | null
          preferred_strategy: 'Best Available' | 'Position Need' | 'Zero RB' | 'Hero RB' | 'Late Round QB' | 'Streaming'
          auto_pick_enabled: boolean
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          league_type?: 'PPR' | 'Standard' | 'Half-PPR' | 'Superflex'
          team_count?: number
          draft_position?: number | null
          preferred_strategy?: 'Best Available' | 'Position Need' | 'Zero RB' | 'Hero RB' | 'Late Round QB' | 'Streaming'
          auto_pick_enabled?: boolean
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          league_type?: 'PPR' | 'Standard' | 'Half-PPR' | 'Superflex'
          team_count?: number
          draft_position?: number | null
          preferred_strategy?: 'Best Available' | 'Position Need' | 'Zero RB' | 'Hero RB' | 'Late Round QB' | 'Streaming'
          auto_pick_enabled?: boolean
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      draft_sessions: {
        Row: {
          id: string
          user_id: string
          league_name: string
          platform: string
          draft_date: string | null
          team_count: number
          draft_position: number
          status: 'active' | 'completed' | 'cancelled'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          league_name: string
          platform: string
          draft_date?: string | null
          team_count: number
          draft_position: number
          status?: 'active' | 'completed' | 'cancelled'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          league_name?: string
          platform?: string
          draft_date?: string | null
          team_count?: number
          draft_position?: number
          status?: 'active' | 'completed' | 'cancelled'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      draft_picks: {
        Row: {
          id: string
          draft_session_id: string
          round: number
          pick_number: number
          player_name: string
          position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
          team: string | null
          recommended: boolean
          recommendation_reason: string | null
          picked_at: string
        }
        Insert: {
          id?: string
          draft_session_id: string
          round: number
          pick_number: number
          player_name: string
          position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
          team?: string | null
          recommended?: boolean
          recommendation_reason?: string | null
          picked_at?: string
        }
        Update: {
          id?: string
          draft_session_id?: string
          round?: number
          pick_number?: number
          player_name?: string
          position?: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
          team?: string | null
          recommended?: boolean
          recommendation_reason?: string | null
          picked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_picks_draft_session_id_fkey"
            columns: ["draft_session_id"]
            isOneToOne: false
            referencedRelation: "draft_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      player_rankings: {
        Row: {
          id: string
          player_name: string
          position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
          team: string | null
          rank: number
          tier: string | null
          adp: number | null
          ppr_points: number | null
          standard_points: number | null
          half_ppr_points: number | null
          injury_status: string | null
          news: string | null
          last_updated: string
        }
        Insert: {
          id?: string
          player_name: string
          position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
          team?: string | null
          rank: number
          tier?: string | null
          adp?: number | null
          ppr_points?: number | null
          standard_points?: number | null
          half_ppr_points?: number | null
          injury_status?: string | null
          news?: string | null
          last_updated?: string
        }
        Update: {
          id?: string
          player_name?: string
          position?: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
          team?: string | null
          rank?: number
          tier?: string | null
          adp?: number | null
          ppr_points?: number | null
          standard_points?: number | null
          half_ppr_points?: number | null
          injury_status?: string | null
          news?: string | null
          last_updated?: string
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          id: string
          player_name: string
          position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
          team: string | null
          season: number
          games_played: number | null
          passing_yards: number | null
          passing_tds: number | null
          passing_ints: number | null
          rushing_yards: number | null
          rushing_tds: number | null
          receiving_yards: number | null
          receiving_tds: number | null
          receptions: number | null
          fantasy_points_ppr: number | null
          fantasy_points_standard: number | null
          fantasy_points_half_ppr: number | null
          created_at: string
        }
        Insert: {
          id?: string
          player_name: string
          position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
          team?: string | null
          season: number
          games_played?: number | null
          passing_yards?: number | null
          passing_tds?: number | null
          passing_ints?: number | null
          rushing_yards?: number | null
          rushing_tds?: number | null
          receiving_yards?: number | null
          receiving_tds?: number | null
          receptions?: number | null
          fantasy_points_ppr?: number | null
          fantasy_points_standard?: number | null
          fantasy_points_half_ppr?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          player_name?: string
          position?: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
          team?: string | null
          season?: number
          games_played?: number | null
          passing_yards?: number | null
          passing_tds?: number | null
          passing_ints?: number | null
          rushing_yards?: number | null
          rushing_tds?: number | null
          receiving_yards?: number | null
          receiving_tds?: number | null
          receptions?: number | null
          fantasy_points_ppr?: number | null
          fantasy_points_standard?: number | null
          fantasy_points_half_ppr?: number | null
          created_at?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          id: string
          user_id: string
          draft_session_id: string | null
          total_drafts: number
          successful_picks: number
          total_picks: number
          average_pick_quality: number
          preferred_positions: Json
          strategy_effectiveness: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          draft_session_id?: string | null
          total_drafts?: number
          successful_picks?: number
          total_picks?: number
          average_pick_quality?: number
          preferred_positions?: Json
          strategy_effectiveness?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          draft_session_id?: string | null
          total_drafts?: number
          successful_picks?: number
          total_picks?: number
          average_pick_quality?: number
          preferred_positions?: Json
          strategy_effectiveness?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_analytics_draft_session_id_fkey"
            columns: ["draft_session_id"]
            isOneToOne: false
            referencedRelation: "draft_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_history: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          subscription_tier: 'free' | 'basic' | 'premium'
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_intent_id?: string | null
          amount: number
          currency?: string
          subscription_tier: 'free' | 'basic' | 'premium'
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          subscription_tier?: 'free' | 'basic' | 'premium'
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'basic' | 'premium'
      league_type: 'PPR' | 'Standard' | 'Half-PPR' | 'Superflex'
      draft_strategy: 'Best Available' | 'Position Need' | 'Zero RB' | 'Hero RB' | 'Late Round QB' | 'Streaming'
      draft_status: 'active' | 'completed' | 'cancelled'
      player_position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type UserProfile = Tables<'user_profiles'>
export type UserPreferences = Tables<'user_preferences'>
export type DraftSession = Tables<'draft_sessions'>
export type DraftPick = Tables<'draft_picks'>
export type PlayerRanking = Tables<'player_rankings'>
export type PlayerStats = Tables<'player_stats'>
export type UserAnalytics = Tables<'user_analytics'>
export type PaymentHistory = Tables<'payment_history'>

// Insert types
export type UserProfileInsert = Inserts<'user_profiles'>
export type UserPreferencesInsert = Inserts<'user_preferences'>
export type DraftSessionInsert = Inserts<'draft_sessions'>
export type DraftPickInsert = Inserts<'draft_picks'>
export type PlayerRankingInsert = Inserts<'player_rankings'>
export type PlayerStatsInsert = Inserts<'player_stats'>
export type UserAnalyticsInsert = Inserts<'user_analytics'>
export type PaymentHistoryInsert = Inserts<'payment_history'>

// Update types
export type UserProfileUpdate = Updates<'user_profiles'>
export type UserPreferencesUpdate = Updates<'user_preferences'>
export type DraftSessionUpdate = Updates<'draft_sessions'>
export type DraftPickUpdate = Updates<'draft_picks'>
export type PlayerRankingUpdate = Updates<'player_rankings'>
export type PlayerStatsUpdate = Updates<'player_stats'>
export type UserAnalyticsUpdate = Updates<'user_analytics'>
export type PaymentHistoryUpdate = Updates<'payment_history'>

// Enum types
export type SubscriptionTier = Database['public']['Enums']['subscription_tier']
export type LeagueType = Database['public']['Enums']['league_type']
export type DraftStrategy = Database['public']['Enums']['draft_strategy']
export type DraftStatus = Database['public']['Enums']['draft_status']
export type PlayerPosition = Database['public']['Enums']['player_position']

// API Response types
export interface DraftRecommendation {
  player: PlayerRanking
  reason: string
  confidence: number
  strategy: DraftStrategy
}

export interface DraftAnalysis {
  sessionId: string
  currentRound: number
  currentPick: number
  teamNeeds: Record<PlayerPosition, number>
  recommendations: DraftRecommendation[]
  bestAvailable: PlayerRanking[]
}

export interface UserDraftHistory {
  sessions: (DraftSession & {
    picks: DraftPick[]
    analytics: {
      totalPicks: number
      successfulPicks: number
      averageQuality: number
    }
  })[]
}

// Utility types
export type WithRelations<T, R extends Record<string, any>> = T & R

export type DraftSessionWithPicks = WithRelations<DraftSession, {
  picks: DraftPick[]
}>

export type UserProfileWithPreferences = WithRelations<UserProfile, {
  preferences: UserPreferences
  analytics: UserAnalytics
}>
