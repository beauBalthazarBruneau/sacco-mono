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
          position: Database["public"]["Enums"]["player_position"]
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
          position: Database["public"]["Enums"]["player_position"]
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
          position?: Database["public"]["Enums"]["player_position"]
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
          status: Database["public"]["Enums"]["draft_status"] | null
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
          status?: Database["public"]["Enums"]["draft_status"] | null
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
          status?: Database["public"]["Enums"]["draft_status"] | null
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
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
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
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
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
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
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
        Relationships: []
      }
      player_stats: {
        Row: {
          created_at: string | null
          fantasy_points_half_ppr: number | null
          fantasy_points_ppr: number | null
          fantasy_points_standard: number | null
          games_played: number | null
          half_ppr_points_per_game: number | null
          id: string
          passing_ints: number | null
          passing_tds: number | null
          passing_yards: number | null
          player_name: string
          position: Database["public"]["Enums"]["player_position"]
          ppr_points_per_game: number | null
          receiving_tds: number | null
          receiving_yards: number | null
          receptions: number | null
          rushing_tds: number | null
          rushing_yards: number | null
          season: number
          standard_points_per_game: number | null
          team: string | null
        }
        Insert: {
          created_at?: string | null
          fantasy_points_half_ppr?: number | null
          fantasy_points_ppr?: number | null
          fantasy_points_standard?: number | null
          games_played?: number | null
          half_ppr_points_per_game?: number | null
          id?: string
          passing_ints?: number | null
          passing_tds?: number | null
          passing_yards?: number | null
          player_name: string
          position: Database["public"]["Enums"]["player_position"]
          ppr_points_per_game?: number | null
          receiving_tds?: number | null
          receiving_yards?: number | null
          receptions?: number | null
          rushing_tds?: number | null
          rushing_yards?: number | null
          season: number
          standard_points_per_game?: number | null
          team?: string | null
        }
        Update: {
          created_at?: string | null
          fantasy_points_half_ppr?: number | null
          fantasy_points_ppr?: number | null
          fantasy_points_standard?: number | null
          games_played?: number | null
          half_ppr_points_per_game?: number | null
          id?: string
          passing_ints?: number | null
          passing_tds?: number | null
          passing_yards?: number | null
          player_name?: string
          position?: Database["public"]["Enums"]["player_position"]
          ppr_points_per_game?: number | null
          receiving_tds?: number | null
          receiving_yards?: number | null
          receptions?: number | null
          rushing_tds?: number | null
          rushing_yards?: number | null
          season?: number
          standard_points_per_game?: number | null
          team?: string | null
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
          league_type: Database["public"]["Enums"]["league_type"] | null
          notifications_enabled: boolean | null
          preferred_strategy:
            | Database["public"]["Enums"]["draft_strategy"]
            | null
          team_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_pick_enabled?: boolean | null
          created_at?: string | null
          draft_position?: number | null
          id?: string
          league_type?: Database["public"]["Enums"]["league_type"] | null
          notifications_enabled?: boolean | null
          preferred_strategy?:
            | Database["public"]["Enums"]["draft_strategy"]
            | null
          team_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_pick_enabled?: boolean | null
          created_at?: string | null
          draft_position?: number | null
          id?: string
          league_type?: Database["public"]["Enums"]["league_type"] | null
          notifications_enabled?: boolean | null
          preferred_strategy?:
            | Database["public"]["Enums"]["draft_strategy"]
            | null
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
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
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
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
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
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
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
      draft_strategy:
        | "Best Available"
        | "Position Need"
        | "Zero RB"
        | "Hero RB"
        | "Late Round QB"
        | "Streaming"
      league_type: "PPR" | "Standard" | "Half-PPR" | "Superflex"
      player_position: "QB" | "RB" | "WR" | "TE" | "K" | "DEF" | "DST"
      subscription_tier: "free" | "basic" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}