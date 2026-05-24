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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          currency: string
          locale: string | null
          preferences: Json | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          locale?: string | null
          preferences?: Json | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          locale?: string | null
          preferences?: Json | null
          updated_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: Database["public"]["Enums"]["account_type"]
          balance: string
          color: string | null
          last_sync_at: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: Database["public"]["Enums"]["account_type"]
          balance?: string
          color?: string | null
          last_sync_at?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: Database["public"]["Enums"]["account_type"]
          balance?: string
          color?: string | null
          last_sync_at?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          icon: string | null
          color: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          is_default: boolean | null
          parent_id: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          icon?: string | null
          color?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          is_default?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          icon?: string | null
          color?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          is_default?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          amount: string
          currency: string
          type: Database["public"]["Enums"]["transaction_type"]
          category_id: string | null
          merchant: string | null
          description: string | null
          date: string
          status: Database["public"]["Enums"]["transaction_status"] | null
          is_subscription: boolean | null
          source: Database["public"]["Enums"]["transaction_source"]
          source_metadata: Json | null
          confidence_score: string | null
          receipt_url: string | null
          is_recurring: boolean | null
          recurring_id: string | null
          is_reviewed: boolean | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          amount: string | number
          currency?: string
          type: Database["public"]["Enums"]["transaction_type"]
          category_id?: string | null
          merchant?: string | null
          description?: string | null
          date: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          is_subscription?: boolean | null
          source?: Database["public"]["Enums"]["transaction_source"]
          source_metadata?: Json | null
          confidence_score?: string | number | null
          receipt_url?: string | null
          is_recurring?: boolean | null
          recurring_id?: string | null
          is_reviewed?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          amount?: string | number
          currency?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          category_id?: string | null
          merchant?: string | null
          description?: string | null
          date?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          is_subscription?: boolean | null
          source?: Database["public"]["Enums"]["transaction_source"]
          source_metadata?: Json | null
          confidence_score?: string | number | null
          receipt_url?: string | null
          is_recurring?: boolean | null
          recurring_id?: string | null
          is_reviewed?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_account_id_accounts_id_fk"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_categories_id_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          period_type: Database["public"]["Enums"]["budget_period"]
          period_start: string
          period_end: string | null
          limit_amount: string
          spent: string | null
          status: Database["public"]["Enums"]["budget_status"] | null
          rollover: boolean | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          period_type?: Database["public"]["Enums"]["budget_period"]
          period_start: string
          period_end?: string | null
          limit_amount: string | number
          spent?: string | number | null
          status?: Database["public"]["Enums"]["budget_status"] | null
          rollover?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          period_type?: Database["public"]["Enums"]["budget_period"]
          period_start?: string
          period_end?: string | null
          limit_amount?: string | number
          spent?: string | number | null
          status?: Database["public"]["Enums"]["budget_status"] | null
          rollover?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_category_id_categories_id_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: string
          current_amount: string
          target_date: string | null
          priority: string | null
          status: Database["public"]["Enums"]["goal_status"] | null
          color: string | null
          icon: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: string | number
          current_amount?: string | number
          target_date?: string | null
          priority?: string | number | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          color?: string | null
          icon?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: string | number
          current_amount?: string | number
          target_date?: string | null
          priority?: string | number | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          color?: string | null
          icon?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          id: string
          user_id: string
          name: string
          total_amount: string
          remaining_amount: string
          interest_rate: string | null
          minimum_payment: string | null
          due_date: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          total_amount: string | number
          remaining_amount: string | number
          interest_rate?: string | number | null
          minimum_payment?: string | number | null
          due_date?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          total_amount?: string | number
          remaining_amount?: string | number
          interest_rate?: string | number | null
          minimum_payment?: string | number | null
          due_date?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debts_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          merchant: string
          service_name: string | null
          amount: string
          currency: string
          interval: Database["public"]["Enums"]["subscription_interval"]
          status: Database["public"]["Enums"]["subscription_status"]
          next_charge_date: string | null
          last_charge_date: string | null
          category_id: string | null
          linked_account_id: string | null
          usage_score: string | null
          potential_savings: boolean | null
          notes: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          merchant: string
          service_name?: string | null
          amount: string | number
          currency?: string
          interval?: Database["public"]["Enums"]["subscription_interval"]
          status?: Database["public"]["Enums"]["subscription_status"]
          next_charge_date?: string | null
          last_charge_date?: string | null
          category_id?: string | null
          linked_account_id?: string | null
          usage_score?: string | number | null
          potential_savings?: boolean | null
          notes?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          merchant?: string
          service_name?: string | null
          amount?: string | number
          currency?: string
          interval?: Database["public"]["Enums"]["subscription_interval"]
          status?: Database["public"]["Enums"]["subscription_status"]
          next_charge_date?: string | null
          last_charge_date?: string | null
          category_id?: string | null
          linked_account_id?: string | null
          usage_score?: string | number | null
          potential_savings?: boolean | null
          notes?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_category_id_categories_id_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_linked_account_id_accounts_id_fk"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_events: {
        Row: {
          id: string
          subscription_id: string
          user_id: string
          event_type: Database["public"]["Enums"]["subscription_event_type"]
          event_date: string
          data: Json | null
        }
        Insert: {
          id?: string
          subscription_id: string
          user_id: string
          event_type: Database["public"]["Enums"]["subscription_event_type"]
          event_date?: string
          data?: Json | null
        }
        Update: {
          id?: string
          subscription_id?: string
          user_id?: string
          event_type?: Database["public"]["Enums"]["subscription_event_type"]
          event_date?: string
          data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_subscription_id_subscriptions_id_fk"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_events_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          period: string
          insights_json: Json
          prompt_payload: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          period: string
          insights_json: Json
          prompt_payload?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          period?: string
          insights_json?: Json
          prompt_payload?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          id: string
          user_id: string
          status: string
          source: string
          file_path: string | null
          row_count: number | null
          error_message: string | null
          created_at: string | null
          updated_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          source?: string
          file_path?: string | null
          row_count?: number | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          source?: string
          file_path?: string | null
          row_count?: number | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      import_rows: {
        Row: {
          id: string
          import_job_id: string
          user_id: string
          raw_row: Json | null
          parsed_date: string | null
          parsed_description: string | null
          parsed_amount: string | null
          parsed_currency: string | null
          parsed_type: string | null
          parsed_merchant: string | null
          parsed_category_id: string | null
          ai_confidence: string | null
          ai_payload: Json | null
          is_duplicate_guess: boolean | null
          is_selected_for_import: boolean | null
          has_error: boolean | null
          error_message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          import_job_id: string
          user_id: string
          raw_row?: Json | null
          parsed_date?: string | null
          parsed_description?: string | null
          parsed_amount?: string | number | null
          parsed_currency?: string | null
          parsed_type?: string | null
          parsed_merchant?: string | null
          parsed_category_id?: string | null
          ai_confidence?: string | number | null
          ai_payload?: Json | null
          is_duplicate_guess?: boolean | null
          is_selected_for_import?: boolean | null
          has_error?: boolean | null
          error_message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          import_job_id?: string
          user_id?: string
          raw_row?: Json | null
          parsed_date?: string | null
          parsed_description?: string | null
          parsed_amount?: string | number | null
          parsed_currency?: string | null
          parsed_type?: string | null
          parsed_merchant?: string | null
          parsed_category_id?: string | null
          ai_confidence?: string | number | null
          ai_payload?: Json | null
          is_duplicate_guess?: boolean | null
          is_selected_for_import?: boolean | null
          has_error?: boolean | null
          error_message?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_rows_import_job_id_import_jobs_id_fk"
            columns: ["import_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_rows_user_id_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_rows_parsed_category_id_categories_id_fk"
            columns: ["parsed_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      account_type: "bank" | "credit_card" | "cash" | "wallet" | "investment"
      budget_period: "monthly" | "quarterly" | "yearly" | "custom"
      budget_status: "active" | "inactive"
      goal_status: "active" | "completed" | "paused"
      subscription_event_type: "created" | "updated" | "paused" | "resumed" | "cancelled" | "charge_detected"
      subscription_interval: "weekly" | "monthly" | "yearly" | "custom"
      subscription_status: "active" | "paused" | "cancelled"
      transaction_source: "manual" | "sms" | "email" | "import"
      transaction_status: "cleared" | "pending"
      transaction_type: "income" | "expense" | "transfer"
    }
    CompositeTypes: Record<string, never>
  }
}

type PublicSchema = Database["public"]
type RowOf<T> = T extends { Row: infer Row } ? Row : never
type InsertOf<T> = T extends { Insert: infer Insert } ? Insert : never
type UpdateOf<T> = T extends { Update: infer Update } ? Update : never

export type Tables<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? RowOf<Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]>
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? RowOf<PublicSchema["Tables"][PublicTableNameOrOptions]>
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? InsertOf<Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]>
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? InsertOf<PublicSchema["Tables"][PublicTableNameOrOptions]>
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? UpdateOf<Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]>
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? UpdateOf<PublicSchema["Tables"][PublicTableNameOrOptions]>
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
