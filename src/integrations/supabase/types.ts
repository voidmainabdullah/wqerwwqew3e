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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          team_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          team_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          team_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
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
          folder_id: string | null
          id: string
          is_locked: boolean
          is_public: boolean
          original_name: string
          password_hash: string | null
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
          folder_id?: string | null
          id?: string
          is_locked?: boolean
          is_public?: boolean
          original_name: string
          password_hash?: string | null
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
          folder_id?: string | null
          id?: string
          is_locked?: boolean
          is_public?: boolean
          original_name?: string
          password_hash?: string | null
          share_code?: string | null
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          name: string
          parent_folder_id: string | null
          share_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          parent_folder_id?: string | null
          share_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          parent_folder_id?: string | null
          share_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_upload_count: number
          daily_upload_limit: number | null
          display_name: string | null
          email: string
          id: string
          last_upload_reset: string | null
          storage_limit: number | null
          storage_used: number | null
          subscription_end_date: string | null
          subscription_status: string | null
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_upload_count?: number
          daily_upload_limit?: number | null
          display_name?: string | null
          email: string
          id: string
          last_upload_reset?: string | null
          storage_limit?: number | null
          storage_used?: number | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_upload_count?: number
          daily_upload_limit?: number | null
          display_name?: string | null
          email?: string
          id?: string
          last_upload_reset?: string | null
          storage_limit?: number | null
          storage_used?: number | null
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
          message: string | null
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
          message?: string | null
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
          message?: string | null
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
      space_members: {
        Row: {
          added_at: string
          id: string
          permissions: Json
          role: Database["public"]["Enums"]["app_role"]
          space_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          permissions?: Json
          role?: Database["public"]["Enums"]["app_role"]
          space_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          permissions?: Json
          role?: Database["public"]["Enums"]["app_role"]
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_archived: boolean
          name: string
          parent_space_id: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name: string
          parent_space_id?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          parent_space_id?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaces_parent_space_id_fkey"
            columns: ["parent_space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spaces_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
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
          space_id: string | null
          team_id: string
        }
        Insert: {
          file_id: string
          id?: string
          shared_at?: string
          shared_by: string
          space_id?: string | null
          team_id: string
        }
        Update: {
          file_id?: string
          id?: string
          shared_at?: string
          shared_by?: string
          space_id?: string | null
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
            foreignKeyName: "team_file_shares_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
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
      team_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_token: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          team_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invite_token: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          team_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey"
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
      team_policies: {
        Row: {
          allow_external_sharing: boolean
          allowed_file_types: string[] | null
          auto_join_domain: string | null
          created_at: string
          default_share_expiry_days: number | null
          id: string
          max_file_size_mb: number | null
          require_2fa: boolean
          require_password_for_shares: boolean
          retention_days: number | null
          team_id: string
          updated_at: string
        }
        Insert: {
          allow_external_sharing?: boolean
          allowed_file_types?: string[] | null
          auto_join_domain?: string | null
          created_at?: string
          default_share_expiry_days?: number | null
          id?: string
          max_file_size_mb?: number | null
          require_2fa?: boolean
          require_password_for_shares?: boolean
          retention_days?: number | null
          team_id: string
          updated_at?: string
        }
        Update: {
          allow_external_sharing?: boolean
          allowed_file_types?: string[] | null
          auto_join_domain?: string | null
          created_at?: string
          default_share_expiry_days?: number | null
          id?: string
          max_file_size_mb?: number | null
          require_2fa?: boolean
          require_password_for_shares?: boolean
          retention_days?: number | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_policies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          team_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          team_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_team_invite: {
        Args: { _invite_token: string; _user_id: string }
        Returns: Json
      }
      admin_toggle_file_lock: {
        Args: { p_file_id: string; p_is_locked: boolean; p_password?: string }
        Returns: boolean
      }
      check_file_access: {
        Args: { p_file_id: string; p_user_id?: string }
        Returns: {
          can_access: boolean
          reason: string
        }[]
      }
      check_storage_quota: {
        Args: { p_file_size: number; p_user_id: string }
        Returns: boolean
      }
      create_file_share: {
        Args:
          | {
              p_download_limit?: number
              p_expires_at?: string
              p_file_id: string
              p_link_type: string
              p_message?: string
              p_password_hash?: string
              p_recipient_email?: string
            }
          | {
              p_download_limit?: number
              p_expires_at?: string
              p_file_id: string
              p_link_type: string
              p_password_hash?: string
              p_recipient_email?: string
            }
        Returns: {
          share_code: string
          share_token: string
        }[]
      }
      create_folder_share: {
        Args: {
          p_expires_at?: string
          p_folder_id: string
          p_link_type: string
          p_password_hash?: string
        }
        Returns: {
          share_code: string
        }[]
      }
      generate_share_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_share_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_folder_contents: {
        Args: { p_folder_id?: string; p_user_id?: string }
        Returns: {
          created_at: string
          download_count: number
          file_size: number
          file_type: string
          folder_id: string
          id: string
          is_locked: boolean
          is_public: boolean
          item_type: string
          name: string
        }[]
      }
      get_my_team_files: {
        Args: { p_user_id: string }
        Returns: {
          can_download: boolean
          can_edit: boolean
          created_at: string
          download_count: number
          file_id: string
          file_name: string
          file_size: number
          file_type: string
          is_locked: boolean
          is_team_admin: boolean
          shared_at: string
          shared_by: string
          sharer_email: string
          team_id: string
          team_name: string
        }[]
      }
      get_team_members: {
        Args: { p_team_id: string }
        Returns: {
          display_name: string
          email: string
          id: string
          joined_at: string
          permissions: Json
          role: string
          user_id: string
        }[]
      }
      get_team_spaces: {
        Args: { _parent_space_id?: string; _team_id: string }
        Returns: {
          created_at: string
          created_by: string
          creator_email: string
          description: string
          file_count: number
          id: string
          is_archived: boolean
          name: string
          parent_space_id: string
          team_id: string
        }[]
      }
      get_user_by_email: {
        Args: { email_input: string }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      get_user_teams: {
        Args: { p_user_id: string }
        Returns: {
          is_admin: boolean
          permissions: Json
          role: string
          team_id: string
          team_name: string
        }[]
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      is_team_owner: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          _action: string
          _entity_id?: string
          _entity_type: string
          _metadata?: Json
          _team_id: string
          _user_id: string
        }
        Returns: string
      }
      reset_daily_upload_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      test_gen_random_bytes: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      test_share_token_generation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      toggle_file_lock_status: {
        Args: { p_file_id: string; p_is_locked: boolean; p_password?: string }
        Returns: boolean
      }
      toggle_file_public_status: {
        Args: { p_file_id: string; p_is_public: boolean }
        Returns: boolean
      }
      update_shared_link_settings: {
        Args: {
          p_download_limit?: number
          p_expires_at?: string
          p_is_active?: boolean
          p_link_id: string
          p_password_hash?: string
        }
        Returns: boolean
      }
      user_has_team_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _team_id: string
          _user_id: string
        }
        Returns: boolean
      }
      user_is_team_admin: {
        Args: { team_id: string; user_id: string }
        Returns: boolean
      }
      user_is_team_member: {
        Args: { team_id: string; user_id: string }
        Returns: boolean
      }
      validate_file_password: {
        Args: { p_file_id: string; p_password: string }
        Returns: boolean
      }
      validate_share_password: {
        Args: { password: string; token: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "member" | "guest" | "readonly"
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
    Enums: {
      app_role: ["owner", "admin", "member", "guest", "readonly"],
    },
  },
} as const
