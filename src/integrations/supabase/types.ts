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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bmi_records: {
        Row: {
          bmi: number
          category: string
          created_at: string
          height: number
          id: string
          user_id: string
          weight: number
        }
        Insert: {
          bmi: number
          category: string
          created_at?: string
          height: number
          id?: string
          user_id: string
          weight: number
        }
        Update: {
          bmi?: number
          category?: string
          created_at?: string
          height?: number
          id?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          habit_name: string
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_name: string
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      health_assessments: {
        Row: {
          assessment_data: Json
          created_at: string
          id: string
          user_id: string
          wellness_summary: Json
        }
        Insert: {
          assessment_data?: Json
          created_at?: string
          id?: string
          user_id: string
          wellness_summary?: Json
        }
        Update: {
          assessment_data?: Json
          created_at?: string
          id?: string
          user_id?: string
          wellness_summary?: Json
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          budget: string
          created_at: string
          diet_preference: string
          health_goal: string
          id: string
          meal_plan: Json
          user_id: string
        }
        Insert: {
          budget: string
          created_at?: string
          diet_preference: string
          health_goal: string
          id?: string
          meal_plan?: Json
          user_id: string
        }
        Update: {
          budget?: string
          created_at?: string
          diet_preference?: string
          health_goal?: string
          id?: string
          meal_plan?: Json
          user_id?: string
        }
        Relationships: []
      }
      nutrition_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          description: string
          id: string
          title: string
        }
        Insert: {
          category: string
          content?: string
          created_at?: string
          description?: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          description?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      nutrition_tips: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          diet_preference: string | null
          full_name: string
          gender: string | null
          health_goal: string | null
          height: number | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          water_goal: number
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          diet_preference?: string | null
          full_name?: string
          gender?: string | null
          health_goal?: string | null
          height?: number | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          water_goal?: number
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          diet_preference?: string | null
          full_name?: string
          gender?: string | null
          health_goal?: string | null
          height?: number | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          water_goal?: number
          weight?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount: number
          created_at: string
          date: string
          goal: number
          id: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          goal?: number
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          goal?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      community_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
