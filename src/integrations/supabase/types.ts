export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      download_logs: {
        Row: {
          download_method: string
          downloaded_at: string
          downloader_ip: unknown | null
          downloader_user_agent: string | null
          file_id: string
          id: string
          shared_link_id: string | null
        }
        Insert: {
          download_method: string
          downloaded_at?: string
          downloader_ip?: unknown | null
          downloader_user_agent?: string | null
          file_id: string
          id?: string
          shared_link_id?: string | null
        }
        Update: {
          download_method?: string
          downloaded_at?: string
          downloader_ip?: unknown | null
          downloader_user_agent?: string | null
          file_id?: string
          id?: string
          shared_link_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_logs_shared_link_id_fkey"
            columns: ["shared_link_id"]
            isOneToOne: false
            referencedRelation: "shared_links"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          download_count: number
          download_limit: number | null
          expires_at: string | null
          file_size: number
          file_type: string
          id: string
          is_locked: boolean
          is_public: boolean
          original_name: string
          share_code: string | null
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          download_count?: number
          download_limit?: number | null
          expires_at?: string | null
          file_size: number
          file_type: string
          id?: string
          is_locked?: boolean
          is_public?: boolean
          original_name: string
          share_code?: string | null
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          download_count?: number
          download_limit?: number | null
          expires_at?: string | null
          file_size?: number
          file_type?: string
          id?: string
          is_locked?: boolean
          is_public?: boolean
          original_name?: string
          share_code?: string | null
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_upload_count: number
          daily_upload_limit: number
          display_name: string | null
          email: string
          id: string
          last_upload_reset: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_upload_count?: number
          daily_upload_limit?: number
          display_name?: string | null
          email: string
          id: string
          last_upload_reset?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_upload_count?: number
          daily_upload_limit?: number
          display_name?: string | null
          email?: string
          id?: string
          last_upload_reset?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_links: {
        Row: {
          created_at: string
          download_count: number
          download_limit: number | null
          expires_at: string | null
          file_id: string
          id: string
          is_active: boolean
          link_type: string
          password_hash: string | null
          recipient_email: string | null
          share_token: string
        }
        Insert: {
          created_at?: string
          download_count?: number
          download_limit?: number | null
          expires_at?: string | null
          file_id: string
          id?: string
          is_active?: boolean
          link_type: string
          password_hash?: string | null
          recipient_email?: string | null
          share_token: string
        }
        Update: {
          created_at?: string
          download_count?: number
          download_limit?: number | null
          expires_at?: string | null
          file_id?: string
          id?: string
          is_active?: boolean
          link_type?: string
          password_hash?: string | null
          recipient_email?: string | null
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_links_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      team_file_shares: {
        Row: {
          file_id: string
          id: string
          shared_at: string
          shared_by: string
          team_id: string
        }
        Insert: {
          file_id: string
          id?: string
          shared_at?: string
          shared_by: string
          team_id: string
        }
        Update: {
          file_id?: string
          id?: string
          shared_at?: string
          shared_by?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_file_shares_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_file_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_file_shares_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          added_by: string
          id: string
          joined_at: string
          permissions: Json | null
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          added_by: string
          id?: string
          joined_at?: string
          permissions?: Json | null
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          added_by?: string
          id?: string
          joined_at?: string
          permissions?: Json | null
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_share_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_team_files: {
        Args: { p_user_id: string }
        Returns: {
          file_id: string
          file_name: string
          file_size: number
          file_type: string
          created_at: string
          is_locked: boolean
          download_count: number
          team_id: string
          team_name: string
          shared_by: string
          shared_at: string
          sharer_email: string
          can_download: boolean
          can_edit: boolean
          is_team_admin: boolean
        }[]
      }
      get_user_by_email: {
        Args: { email_input: string }
        Returns: {
          user_id: string
          email: string
        }[]
      }
      get_user_teams: {
        Args: { p_user_id: string }
        Returns: {
          team_id: string
          team_name: string
          is_admin: boolean
          role: string
          permissions: Json
        }[]
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      reset_daily_upload_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_is_team_admin: {
        Args: { team_id: string; user_id: string }
        Returns: boolean
      }
      user_is_team_member: {
        Args: { team_id: string; user_id: string }
        Returns: boolean
      }
      validate_share_password: {
        Args: { token: string; password: string }
        Returns: boolean
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
