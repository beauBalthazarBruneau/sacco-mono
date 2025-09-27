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
      }
      player_rankings: {
        Row: {
          adp: number | null
          half_ppr_points: number | null
          half_ppr_points_per_game: number | null
          id: string
          last_updated: string | null
          player_name: string
          position: string | null
          ppr_points: number | null
          ppr_points_per_game: number | null
          standard_points: number | null
          standard_points_per_game: number | null
          team: string | null
        }
        Insert: {
          adp?: number | null
          half_ppr_points?: number | null
          half_ppr_points_per_game?: number | null
          id?: string
          last_updated?: string | null
          player_name: string
          position?: string | null
          ppr_points?: number | null
          ppr_points_per_game?: number | null
          standard_points?: number | null
          standard_points_per_game?: number | null
          team?: string | null
        }
        Update: {
          adp?: number | null
          half_ppr_points?: number | null
          half_ppr_points_per_game?: number | null
          id?: string
          last_updated?: string | null
          player_name?: string
          position?: string | null
          ppr_points?: number | null
          ppr_points_per_game?: number | null
          standard_points?: number | null
          standard_points_per_game?: number | null
          team?: string | null
        }
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
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}