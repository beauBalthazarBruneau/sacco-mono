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
      draft_picks: {
        Row: {
          draft_session_id: string
          id: string
          pick_number: number
          picked_at: string | null
          player_name: string
          position: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL'
          recommendation_reason: string | null
          recommended: boolean | null
          round: number
          team: string | null
        }
        Insert: {
          draft_session_id: string
          id?: string
          pick_number: number
          picked_at?: string | null
          player_name: string
          position: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL'
          recommendation_reason?: string | null
          recommended?: boolean | null
          round: number
          team?: string | null
        }
        Update: {
          draft_session_id?: string
          id?: string
          pick_number?: number
          picked_at?: string | null
          player_name?: string
          position?: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL'
          recommendation_reason?: string | null
          recommended?: boolean | null
          round?: number
          team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_picks_draft_session_id_fkey"
            columns: ["draft_session_id"]
            isOneToOne: false
            referencedRelation: "draft_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_sessions: {
        Row: {
          created_at: string | null
          draft_date: string | null
          draft_position: number
          id: string
          league_name: string
          platform: string
          settings: Json | null
          status: 'active' | 'completed' | 'cancelled' | null
          team_count: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          draft_date?: string | null
          draft_position: number
          id?: string
          league_name: string
          platform: string
          settings?: Json | null
          status?: 'active' | 'completed' | 'cancelled' | null
          team_count: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          draft_date?: string | null
          draft_position?: number
          id?: string
          league_name?: string
          platform?: string
          settings?: Json | null
          status?: 'active' | 'completed' | 'cancelled' | null
          team_count?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: 'free' | 'basic' | 'premium'
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier: 'free' | 'basic' | 'premium'
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: 'free' | 'basic' | 'premium'
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_rankings: {
        Row: {
          adp: number | null
          categories_points: number | null
          categories_rank: number | null
          id: string
          last_updated: string | null
          player_name: string
          points_league_points: number | null
          points_rank: number | null
          position: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL' | null
          projected_assists: number | null
          projected_blocks: number | null
          projected_points: number | null
          projected_rebounds: number | null
          projected_steals: number | null
          team: string | null
        }
        Insert: {
          adp?: number | null
          categories_points?: number | null
          categories_rank?: number | null
          id?: string
          last_updated?: string | null
          player_name: string
          points_league_points?: number | null
          points_rank?: number | null
          position?: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL' | null
          projected_assists?: number | null
          projected_blocks?: number | null
          projected_points?: number | null
          projected_rebounds?: number | null
          projected_steals?: number | null
          team?: string | null
        }
        Update: {
          adp?: number | null
          categories_points?: number | null
          categories_rank?: number | null
          id?: string
          last_updated?: string | null
          player_name?: string
          points_league_points?: number | null
          points_rank?: number | null
          position?: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL' | null
          projected_assists?: number | null
          projected_blocks?: number | null
          projected_points?: number | null
          projected_rebounds?: number | null
          projected_steals?: number | null
          team?: string | null
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          assists: number | null
          assists_per_game: number | null
          blocks: number | null
          created_at: string | null
          fantasy_points_categories: number | null
          fantasy_points_points: number | null
          field_goal_percentage: number | null
          field_goals_attempted: number | null
          field_goals_made: number | null
          free_throw_percentage: number | null
          free_throws_attempted: number | null
          free_throws_made: number | null
          games_played: number | null
          id: string
          minutes_played: number | null
          player_name: string
          points: number | null
          points_per_game: number | null
          position: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL'
          rebounds: number | null
          rebounds_per_game: number | null
          season: number
          steals: number | null
          team: string | null
          three_point_percentage: number | null
          three_pointers_attempted: number | null
          three_pointers_made: number | null
          turnovers: number | null
        }
        Insert: {
          assists?: number | null
          assists_per_game?: number | null
          blocks?: number | null
          created_at?: string | null
          fantasy_points_categories?: number | null
          fantasy_points_points?: number | null
          field_goal_percentage?: number | null
          field_goals_attempted?: number | null
          field_goals_made?: number | null
          free_throw_percentage?: number | null
          free_throws_attempted?: number | null
          free_throws_made?: number | null
          games_played?: number | null
          id?: string
          minutes_played?: number | null
          player_name: string
          points?: number | null
          points_per_game?: number | null
          position: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL'
          rebounds?: number | null
          rebounds_per_game?: number | null
          season: number
          steals?: number | null
          team?: string | null
          three_point_percentage?: number | null
          three_pointers_attempted?: number | null
          three_pointers_made?: number | null
          turnovers?: number | null
        }
        Update: {
          assists?: number | null
          assists_per_game?: number | null
          blocks?: number | null
          created_at?: string | null
          fantasy_points_categories?: number | null
          fantasy_points_points?: number | null
          field_goal_percentage?: number | null
          field_goals_attempted?: number | null
          field_goals_made?: number | null
          free_throw_percentage?: number | null
          free_throws_attempted?: number | null
          free_throws_made?: number | null
          games_played?: number | null
          id?: string
          minutes_played?: number | null
          player_name?: string
          points?: number | null
          points_per_game?: number | null
          position?: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F' | 'UTIL'
          rebounds?: number | null
          rebounds_per_game?: number | null
          season?: number
          steals?: number | null
          team?: string | null
          three_point_percentage?: number | null
          three_pointers_attempted?: number | null
          three_pointers_made?: number | null
          turnovers?: number | null
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          average_pick_quality: number | null
          created_at: string | null
          draft_session_id: string | null
          id: string
          preferred_positions: Json | null
          strategy_effectiveness: Json | null
          successful_picks: number | null
          total_drafts: number | null
          total_picks: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_pick_quality?: number | null
          created_at?: string | null
          draft_session_id?: string | null
          id?: string
          preferred_positions?: Json | null
          strategy_effectiveness?: Json | null
          successful_picks?: number | null
          total_drafts?: number | null
          total_picks?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_pick_quality?: number | null
          created_at?: string | null
          draft_session_id?: string | null
          id?: string
          preferred_positions?: Json | null
          strategy_effectiveness?: Json | null
          successful_picks?: number | null
          total_drafts?: number | null
          total_picks?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_draft_session_id_fkey"
            columns: ["draft_session_id"]
            isOneToOne: false
            referencedRelation: "draft_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          auto_pick_enabled: boolean | null
          created_at: string | null
          draft_position: number | null
          id: string
          league_type: 'Points' | 'Categories' | 'Head2Head' | 'Roto' | null
          notifications_enabled: boolean | null
          preferred_strategy: 'Best Available' | 'Position Need' | 'Punt Strategy' | 'Stars and Scrubs' | 'Balanced Build' | 'Category Focus' | null
          team_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_pick_enabled?: boolean | null
          created_at?: string | null
          draft_position?: number | null
          id?: string
          league_type?: 'Points' | 'Categories' | 'Head2Head' | 'Roto' | null
          notifications_enabled?: boolean | null
          preferred_strategy?: 'Best Available' | 'Position Need' | 'Punt Strategy' | 'Stars and Scrubs' | 'Balanced Build' | 'Category Focus' | null
          team_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_pick_enabled?: boolean | null
          created_at?: string | null
          draft_position?: number | null
          id?: string
          league_type?: 'Points' | 'Categories' | 'Head2Head' | 'Roto' | null
          notifications_enabled?: boolean | null
          preferred_strategy?: 'Best Available' | 'Position Need' | 'Punt Strategy' | 'Stars and Scrubs' | 'Balanced Build' | 'Category Focus' | null
          team_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          draft_picks_limit: number | null
          draft_picks_used: number | null
          email: string
          id: string
          stripe_customer_id: string | null
          subscription_expires_at: string | null
          subscription_tier: 'free' | 'basic' | 'premium' | null
          trial_started_at: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          draft_picks_limit?: number | null
          draft_picks_used?: number | null
          email: string
          id: string
          stripe_customer_id?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: 'free' | 'basic' | 'premium' | null
          trial_started_at?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          draft_picks_limit?: number | null
          draft_picks_used?: number | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: 'free' | 'basic' | 'premium' | null
          trial_started_at?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      draft_status: "active" | "completed" | "cancelled"
      draft_strategy: "Best Available" | "Position Need" | "Punt Strategy" | "Stars and Scrubs" | "Balanced Build" | "Category Focus"
      league_type: "Points" | "Categories" | "Head2Head" | "Roto"
      player_position: "PG" | "SG" | "SF" | "PF" | "C" | "G" | "F" | "UTIL"
      subscription_tier: "free" | "basic" | "premium"
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

// Basketball-specific API Response types
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