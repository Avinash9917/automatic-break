export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      break_sessions: {
        Row: {
          actual_duration: number | null
          content_type: string | null
          created_at: string
          effectiveness_rating: number | null
          ended_at: string | null
          ended_early: boolean | null
          id: string
          scheduled_duration: number
          started_at: string
          user_id: string
        }
        Insert: {
          actual_duration?: number | null
          content_type?: string | null
          created_at?: string
          effectiveness_rating?: number | null
          ended_at?: string | null
          ended_early?: boolean | null
          id?: string
          scheduled_duration: number
          started_at: string
          user_id: string
        }
        Update: {
          actual_duration?: number | null
          content_type?: string | null
          created_at?: string
          effectiveness_rating?: number | null
          ended_at?: string | null
          ended_early?: boolean | null
          id?: string
          scheduled_duration?: number
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_ratings: {
        Row: {
          break_session_id: string | null
          content_id: string
          content_type: string
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          break_session_id?: string | null
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          break_session_id?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_ratings_break_session_id_fkey"
            columns: ["break_session_id"]
            isOneToOne: false
            referencedRelation: "break_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          photo_date: string | null
          selected_for_breaks: boolean | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          photo_date?: string | null
          selected_for_breaks?: boolean | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          photo_date?: string | null
          selected_for_breaks?: boolean | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          audio_playback_enabled: boolean | null
          break_duration_minutes: number | null
          break_frequency_minutes: number | null
          content_types: string[] | null
          created_at: string
          id: string
          music_genres: string[] | null
          notification_enabled: boolean | null
          notification_warning_minutes: number | null
          photo_timeframe_end: number | null
          photo_timeframe_start: number | null
          smart_scheduling: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_playback_enabled?: boolean | null
          break_duration_minutes?: number | null
          break_frequency_minutes?: number | null
          content_types?: string[] | null
          created_at?: string
          id?: string
          music_genres?: string[] | null
          notification_enabled?: boolean | null
          notification_warning_minutes?: number | null
          photo_timeframe_end?: number | null
          photo_timeframe_start?: number | null
          smart_scheduling?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_playback_enabled?: boolean | null
          break_duration_minutes?: number | null
          break_frequency_minutes?: number | null
          content_types?: string[] | null
          created_at?: string
          id?: string
          music_genres?: string[] | null
          notification_enabled?: boolean | null
          notification_warning_minutes?: number | null
          photo_timeframe_end?: number | null
          photo_timeframe_start?: number | null
          smart_scheduling?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          google_photos_connected: boolean | null
          id: string
          music_service: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          google_photos_connected?: boolean | null
          id: string
          music_service?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          google_photos_connected?: boolean | null
          id?: string
          music_service?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_break_stats: {
        Args: { days?: number; user_uuid: string }
        Returns: {
          average_rating: number
          completion_rate: number
          total_breaks: number
          total_minutes: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
