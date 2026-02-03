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
          is_active: boolean | null
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
          is_active?: boolean | null
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
          is_active?: boolean | null
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
      doctor_videos: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          doctor_id: string
          id: string
          is_active: boolean | null
          is_intro: boolean | null
          title: string | null
          updated_at: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          doctor_id: string
          id?: string
          is_active?: boolean | null
          is_intro?: boolean | null
          title?: string | null
          updated_at?: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          doctor_id?: string
          id?: string
          is_active?: boolean | null
          is_intro?: boolean | null
          title?: string | null
          updated_at?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_videos_doctor_id_fkey"
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
      investigations: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          name_bn: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          name_bn?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          name_bn?: string | null
        }
        Relationships: []
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
          investigations: Json | null
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
          investigations?: Json | null
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
          investigations?: Json | null
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
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          bio: string | null
          bmdc_number: string | null
          chamber_address: string | null
          cover_photo_url: string | null
          created_at: string
          custom_info: Json | null
          degrees: string[] | null
          doctor_code: string | null
          education: Json | null
          email: string | null
          experience_years: number | null
          full_name: string
          id: string
          is_approved: boolean | null
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
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          bmdc_number?: string | null
          chamber_address?: string | null
          cover_photo_url?: string | null
          created_at?: string
          custom_info?: Json | null
          degrees?: string[] | null
          doctor_code?: string | null
          education?: Json | null
          email?: string | null
          experience_years?: number | null
          full_name: string
          id?: string
          is_approved?: boolean | null
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
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          bio?: string | null
          bmdc_number?: string | null
          chamber_address?: string | null
          cover_photo_url?: string | null
          created_at?: string
          custom_info?: Json | null
          degrees?: string[] | null
          doctor_code?: string | null
          education?: Json | null
          email?: string | null
          experience_years?: number | null
          full_name?: string
          id?: string
          is_approved?: boolean | null
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
      queue_sessions: {
        Row: {
          avg_consultation_minutes: number | null
          booking_open: boolean | null
          chamber_id: string
          created_at: string
          current_token: number | null
          doctor_id: string
          end_time: string
          id: string
          is_custom: boolean | null
          max_patients: number | null
          notes: string | null
          session_date: string
          start_time: string
          status: string | null
          updated_at: string
        }
        Insert: {
          avg_consultation_minutes?: number | null
          booking_open?: boolean | null
          chamber_id: string
          created_at?: string
          current_token?: number | null
          doctor_id: string
          end_time: string
          id?: string
          is_custom?: boolean | null
          max_patients?: number | null
          notes?: string | null
          session_date: string
          start_time: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          avg_consultation_minutes?: number | null
          booking_open?: boolean | null
          chamber_id?: string
          created_at?: string
          current_token?: number | null
          doctor_id?: string
          end_time?: string
          id?: string
          is_custom?: boolean | null
          max_patients?: number | null
          notes?: string | null
          session_date?: string
          start_time?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_sessions_chamber_id_fkey"
            columns: ["chamber_id"]
            isOneToOne: false
            referencedRelation: "chambers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_sessions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_tokens: {
        Row: {
          booked_by: string | null
          called_at: string | null
          chamber_id: string | null
          completed_at: string | null
          created_at: string
          doctor_id: string
          estimated_time: string | null
          id: string
          patient_id: string
          payment_amount: number | null
          payment_collected: boolean | null
          payment_method: string | null
          prescription_id: string | null
          queue_date: string
          serial_number: string | null
          session_id: string | null
          status: string | null
          token_number: number
          visiting_reason: string | null
        }
        Insert: {
          booked_by?: string | null
          called_at?: string | null
          chamber_id?: string | null
          completed_at?: string | null
          created_at?: string
          doctor_id: string
          estimated_time?: string | null
          id?: string
          patient_id: string
          payment_amount?: number | null
          payment_collected?: boolean | null
          payment_method?: string | null
          prescription_id?: string | null
          queue_date?: string
          serial_number?: string | null
          session_id?: string | null
          status?: string | null
          token_number: number
          visiting_reason?: string | null
        }
        Update: {
          booked_by?: string | null
          called_at?: string | null
          chamber_id?: string | null
          completed_at?: string | null
          created_at?: string
          doctor_id?: string
          estimated_time?: string | null
          id?: string
          patient_id?: string
          payment_amount?: number | null
          payment_collected?: boolean | null
          payment_method?: string | null
          prescription_id?: string | null
          queue_date?: string
          serial_number?: string | null
          session_id?: string | null
          status?: string | null
          token_number?: number
          visiting_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "queue_tokens_chamber_id_fkey"
            columns: ["chamber_id"]
            isOneToOne: false
            referencedRelation: "chambers"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "queue_tokens_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "queue_sessions"
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
      staff_chamber_access: {
        Row: {
          can_manage_patients: boolean | null
          can_manage_queue: boolean | null
          can_view_prescriptions: boolean | null
          chamber_id: string
          created_at: string | null
          id: string
          staff_id: string
        }
        Insert: {
          can_manage_patients?: boolean | null
          can_manage_queue?: boolean | null
          can_view_prescriptions?: boolean | null
          chamber_id: string
          created_at?: string | null
          id?: string
          staff_id: string
        }
        Update: {
          can_manage_patients?: boolean | null
          can_manage_queue?: boolean | null
          can_view_prescriptions?: boolean | null
          chamber_id?: string
          created_at?: string | null
          id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_chamber_access_chamber_id_fkey"
            columns: ["chamber_id"]
            isOneToOne: false
            referencedRelation: "chambers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_chamber_access_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          doctor_id: string
          email: string
          full_name: string
          id: string
          invited_at: string | null
          is_active: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          doctor_id: string
          email: string
          full_name: string
          id?: string
          invited_at?: string | null
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          doctor_id?: string
          email?: string
          full_name?: string
          id?: string
          invited_at?: string | null
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          billing_period: string
          created_at: string
          doctor_id: string
          id: string
          payer_mobile: string
          payment_method: string
          plan_tier: string
          status: string
          transaction_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          billing_period: string
          created_at?: string
          doctor_id: string
          id?: string
          payer_mobile: string
          payment_method: string
          plan_tier: string
          status?: string
          transaction_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          billing_period?: string
          created_at?: string
          doctor_id?: string
          id?: string
          payer_mobile?: string
          payment_method?: string
          plan_tier?: string
          status?: string
          transaction_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          can_export_data: boolean | null
          can_use_analytics: boolean | null
          can_use_custom_branding: boolean | null
          can_use_public_profile: boolean | null
          can_use_queue_booking: boolean | null
          can_use_whatsapp_notifications: boolean | null
          created_at: string
          currency: string | null
          description: string | null
          discount_biannual: number | null
          discount_quarterly: number | null
          discount_yearly: number | null
          id: string
          max_chambers: number | null
          max_patients: number | null
          max_prescriptions_per_month: number | null
          max_staff: number | null
          name: string
          price_biannual: number | null
          price_monthly: number | null
          price_quarterly: number | null
          price_yearly: number | null
          sms_credits: number | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          can_export_data?: boolean | null
          can_use_analytics?: boolean | null
          can_use_custom_branding?: boolean | null
          can_use_public_profile?: boolean | null
          can_use_queue_booking?: boolean | null
          can_use_whatsapp_notifications?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          discount_biannual?: number | null
          discount_quarterly?: number | null
          discount_yearly?: number | null
          id?: string
          max_chambers?: number | null
          max_patients?: number | null
          max_prescriptions_per_month?: number | null
          max_staff?: number | null
          name: string
          price_biannual?: number | null
          price_monthly?: number | null
          price_quarterly?: number | null
          price_yearly?: number | null
          sms_credits?: number | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          can_export_data?: boolean | null
          can_use_analytics?: boolean | null
          can_use_custom_branding?: boolean | null
          can_use_public_profile?: boolean | null
          can_use_queue_booking?: boolean | null
          can_use_whatsapp_notifications?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          discount_biannual?: number | null
          discount_quarterly?: number | null
          discount_yearly?: number | null
          id?: string
          max_chambers?: number | null
          max_patients?: number | null
          max_prescriptions_per_month?: number | null
          max_staff?: number | null
          name?: string
          price_biannual?: number | null
          price_monthly?: number | null
          price_quarterly?: number | null
          price_yearly?: number | null
          sms_credits?: number | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          created_at: string
          current_month: string | null
          doctor_id: string
          id: string
          patients_added_this_month: number | null
          prescriptions_this_month: number | null
          sms_sent_this_month: number | null
          total_patients: number | null
          total_prescriptions: number | null
          total_sms_sent: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_month?: string | null
          doctor_id: string
          id?: string
          patients_added_this_month?: number | null
          prescriptions_this_month?: number | null
          sms_sent_this_month?: number | null
          total_patients?: number | null
          total_prescriptions?: number | null
          total_sms_sent?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_month?: string | null
          doctor_id?: string
          id?: string
          patients_added_this_month?: number | null
          prescriptions_this_month?: number | null
          sms_sent_this_month?: number | null
          total_patients?: number | null
          total_prescriptions?: number | null
          total_sms_sent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_replies: {
        Row: {
          created_at: string
          id: string
          is_admin_reply: boolean | null
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin_reply?: boolean | null
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_admin_reply?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_email: string
          user_id: string | null
          user_name: string
          user_phone: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_email: string
          user_id?: string | null
          user_name: string
          user_phone?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string
          user_phone?: string | null
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
      video_tutorials: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          page_path: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_path: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_path?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
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
      get_staff_doctor_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff_of: {
        Args: { _doctor_id: string; _user_id: string }
        Returns: boolean
      }
      reset_monthly_usage: { Args: never; Returns: undefined }
      staff_has_chamber_access: {
        Args: { _chamber_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "super_admin"
      staff_role: "receptionist" | "assistant" | "manager"
      subscription_tier: "basic" | "pro" | "premium" | "trial" | "enterprise"
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
      app_role: ["admin", "super_admin"],
      staff_role: ["receptionist", "assistant", "manager"],
      subscription_tier: ["basic", "pro", "premium", "trial", "enterprise"],
    },
  },
} as const
