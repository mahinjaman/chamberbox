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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          calendly_event_id: string | null
          chamber_id: string
          created_at: string
          doctor_id: string
          fee: number
          id: string
          is_follow_up: boolean | null
          notification_sent_at: string | null
          patient_age: number | null
          patient_gender: string | null
          patient_name: string
          patient_phone: string
          payment_method: string | null
          payment_status: string | null
          reminder_sent_at: string | null
          status: string | null
          symptoms: string | null
          token_number: number
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          calendly_event_id?: string | null
          chamber_id: string
          created_at?: string
          doctor_id: string
          fee: number
          id?: string
          is_follow_up?: boolean | null
          notification_sent_at?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name: string
          patient_phone: string
          payment_method?: string | null
          payment_status?: string | null
          reminder_sent_at?: string | null
          status?: string | null
          symptoms?: string | null
          token_number: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          calendly_event_id?: string | null
          chamber_id?: string
          created_at?: string
          doctor_id?: string
          fee?: number
          id?: string
          is_follow_up?: boolean | null
          notification_sent_at?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string
          patient_phone?: string
          payment_method?: string | null
          payment_status?: string | null
          reminder_sent_at?: string | null
          status?: string | null
          symptoms?: string | null
          token_number?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_chamber_id_fkey"
            columns: ["chamber_id"]
            isOneToOne: false
            referencedRelation: "chambers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          chamber_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          slot_duration_minutes: number | null
          start_time: string
        }
        Insert: {
          chamber_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          slot_duration_minutes?: number | null
          start_time: string
        }
        Update: {
          chamber_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          slot_duration_minutes?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_chamber_id_fkey"
            columns: ["chamber_id"]
            isOneToOne: false
            referencedRelation: "chambers"
            referencedColumns: ["id"]
          },
        ]
      }
      chambers: {
        Row: {
          address: string
          contact_number: string | null
          created_at: string
          doctor_id: string
          id: string
          is_primary: boolean | null
          location_lat: number | null
          location_lng: number | null
          name: string
          new_patient_fee: number | null
          return_patient_fee: number | null
          updated_at: string
        }
        Insert: {
          address: string
          contact_number?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          is_primary?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          new_patient_fee?: number | null
          return_patient_fee?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          contact_number?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          is_primary?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          new_patient_fee?: number | null
          return_patient_fee?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chambers_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          calendly_buffer_minutes: number | null
          calendly_display_mode: string | null
          calendly_enabled: boolean | null
          calendly_event_type: string | null
          calendly_url: string | null
          calendly_verified: boolean | null
          confirmation_template: string | null
          created_at: string
          doctor_id: string
          followup_template: string | null
          id: string
          reminder_hours_before: number | null
          reminder_template: string | null
          send_booking_confirmation: boolean | null
          send_followup_after: boolean | null
          send_reminder_before: boolean | null
          updated_at: string
          whatsapp_api_key: string | null
          whatsapp_api_provider: string | null
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
          whatsapp_template_id: string | null
        }
        Insert: {
          calendly_buffer_minutes?: number | null
          calendly_display_mode?: string | null
          calendly_enabled?: boolean | null
          calendly_event_type?: string | null
          calendly_url?: string | null
          calendly_verified?: boolean | null
          confirmation_template?: string | null
          created_at?: string
          doctor_id: string
          followup_template?: string | null
          id?: string
          reminder_hours_before?: number | null
          reminder_template?: string | null
          send_booking_confirmation?: boolean | null
          send_followup_after?: boolean | null
          send_reminder_before?: boolean | null
          updated_at?: string
          whatsapp_api_key?: string | null
          whatsapp_api_provider?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
          whatsapp_template_id?: string | null
        }
        Update: {
          calendly_buffer_minutes?: number | null
          calendly_display_mode?: string | null
          calendly_enabled?: boolean | null
          calendly_event_type?: string | null
          calendly_url?: string | null
          calendly_verified?: boolean | null
          confirmation_template?: string | null
          created_at?: string
          doctor_id?: string
          followup_template?: string | null
          id?: string
          reminder_hours_before?: number | null
          reminder_template?: string | null
          send_booking_confirmation?: boolean | null
          send_followup_after?: boolean | null
          send_reminder_before?: boolean | null
          updated_at?: string
          whatsapp_api_key?: string | null
          whatsapp_api_provider?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
          whatsapp_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_settings_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          brand_name: string
          brand_name_bn: string | null
          created_at: string
          default_dosage: string | null
          dosage_form: string | null
          generic_name: string
          id: string
          manufacturer: string | null
          strength: string | null
        }
        Insert: {
          brand_name: string
          brand_name_bn?: string | null
          created_at?: string
          default_dosage?: string | null
          dosage_form?: string | null
          generic_name: string
          id?: string
          manufacturer?: string | null
          strength?: string | null
        }
        Update: {
          brand_name?: string
          brand_name_bn?: string | null
          created_at?: string
          default_dosage?: string | null
          dosage_form?: string | null
          generic_name?: string
          id?: string
          manufacturer?: string | null
          strength?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          allergies: string[] | null
          blood_group: string | null
          chronic_conditions: string[] | null
          created_at: string
          doctor_id: string
          gender: string | null
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          allergies?: string[] | null
          blood_group?: string | null
          chronic_conditions?: string[] | null
          created_at?: string
          doctor_id: string
          gender?: string | null
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number | null
          allergies?: string[] | null
          blood_group?: string | null
          chronic_conditions?: string[] | null
          created_at?: string
          doctor_id?: string
          gender?: string | null
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_templates: {
        Row: {
          advice: string | null
          created_at: string
          doctor_id: string
          id: string
          medicines: Json
          name: string
        }
        Insert: {
          advice?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          medicines?: Json
          name: string
        }
        Update: {
          advice?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          medicines?: Json
          name?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          advice: string | null
          created_at: string
          doctor_id: string
          id: string
          language: string | null
          medicines: Json
          next_visit_date: string | null
          patient_id: string
          qr_code: string | null
          template_name: string | null
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          advice?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          language?: string | null
          medicines?: Json
          next_visit_date?: string | null
          patient_id: string
          qr_code?: string | null
          template_name?: string | null
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          advice?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          language?: string | null
          medicines?: Json
          next_visit_date?: string | null
          patient_id?: string
          qr_code?: string | null
          template_name?: string | null
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bmdc_number: string | null
          chamber_address: string | null
          cover_photo_url: string | null
          created_at: string
          custom_info: Json | null
          degrees: string[] | null
          education: Json | null
          email: string | null
          experience_years: number | null
          full_name: string
          id: string
          is_public: boolean | null
          languages: string[] | null
          patient_count: number | null
          phone: string | null
          rating: number | null
          seo_description: string | null
          seo_title: string | null
          services: string[] | null
          slug: string | null
          social_links: Json | null
          specialization: string | null
          subscription_expires_at: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string
          user_id: string
          verified: boolean | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bmdc_number?: string | null
          chamber_address?: string | null
          cover_photo_url?: string | null
          created_at?: string
          custom_info?: Json | null
          degrees?: string[] | null
          education?: Json | null
          email?: string | null
          experience_years?: number | null
          full_name: string
          id?: string
          is_public?: boolean | null
          languages?: string[] | null
          patient_count?: number | null
          phone?: string | null
          rating?: number | null
          seo_description?: string | null
          seo_title?: string | null
          services?: string[] | null
          slug?: string | null
          social_links?: Json | null
          specialization?: string | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bmdc_number?: string | null
          chamber_address?: string | null
          cover_photo_url?: string | null
          created_at?: string
          custom_info?: Json | null
          degrees?: string[] | null
          education?: Json | null
          email?: string | null
          experience_years?: number | null
          full_name?: string
          id?: string
          is_public?: boolean | null
          languages?: string[] | null
          patient_count?: number | null
          phone?: string | null
          rating?: number | null
          seo_description?: string | null
          seo_title?: string | null
          services?: string[] | null
          slug?: string | null
          social_links?: Json | null
          specialization?: string | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      queue_tokens: {
        Row: {
          called_at: string | null
          completed_at: string | null
          created_at: string
          doctor_id: string
          estimated_time: string | null
          id: string
          patient_id: string
          queue_date: string
          status: string | null
          token_number: number
        }
        Insert: {
          called_at?: string | null
          completed_at?: string | null
          created_at?: string
          doctor_id: string
          estimated_time?: string | null
          id?: string
          patient_id: string
          queue_date?: string
          status?: string | null
          token_number: number
        }
        Update: {
          called_at?: string | null
          completed_at?: string | null
          created_at?: string
          doctor_id?: string
          estimated_time?: string | null
          id?: string
          patient_id?: string
          queue_date?: string
          status?: string | null
          token_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "queue_tokens_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_tokens_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_settings: {
        Row: {
          api_key: string | null
          created_at: string
          doctor_id: string
          due_reminder: boolean | null
          followup_reminder: boolean | null
          gateway: string | null
          id: string
          sender_id: string | null
          token_notification: boolean | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          doctor_id: string
          due_reminder?: boolean | null
          followup_reminder?: boolean | null
          gateway?: string | null
          id?: string
          sender_id?: string | null
          token_notification?: boolean | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          doctor_id?: string
          due_reminder?: boolean | null
          followup_reminder?: boolean | null
          gateway?: string | null
          id?: string
          sender_id?: string | null
          token_notification?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          doctor_id: string
          id: string
          patient_id: string | null
          payment_method: string | null
          transaction_date: string
          type: string
          visit_id: string | null
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          description?: string | null
          doctor_id: string
          id?: string
          patient_id?: string | null
          payment_method?: string | null
          transaction_date?: string
          type: string
          visit_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          doctor_id?: string
          id?: string
          patient_id?: string | null
          payment_method?: string | null
          transaction_date?: string
          type?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          advice: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          fees: number | null
          id: string
          medicines: Json | null
          next_visit_date: string | null
          patient_id: string
          payment_status: string | null
          symptoms: string | null
          visit_date: string
        }
        Insert: {
          advice?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          fees?: number | null
          id?: string
          medicines?: Json | null
          next_visit_date?: string | null
          patient_id: string
          payment_status?: string | null
          symptoms?: string | null
          visit_date?: string
        }
        Update: {
          advice?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          fees?: number | null
          id?: string
          medicines?: Json | null
          next_visit_date?: string | null
          patient_id?: string
          payment_status?: string | null
          symptoms?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_integration_settings: {
        Row: {
          calendly_buffer_minutes: number | null
          calendly_display_mode: string | null
          calendly_enabled: boolean | null
          calendly_event_type: string | null
          calendly_url: string | null
          doctor_id: string | null
          id: string | null
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          calendly_buffer_minutes?: number | null
          calendly_display_mode?: string | null
          calendly_enabled?: boolean | null
          calendly_event_type?: string | null
          calendly_url?: string | null
          doctor_id?: string | null
          id?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          calendly_buffer_minutes?: number | null
          calendly_display_mode?: string | null
          calendly_enabled?: boolean | null
          calendly_event_type?: string | null
          calendly_url?: string | null
          doctor_id?: string | null
          id?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_settings_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: "basic" | "pro" | "premium"
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
      subscription_tier: ["basic", "pro", "premium"],
    },
  },
} as const
