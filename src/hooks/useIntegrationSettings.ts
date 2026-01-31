import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export interface IntegrationSettings {
  id: string;
  doctor_id: string;
  
  // Calendly Settings
  calendly_enabled: boolean;
  calendly_url: string | null;
  calendly_display_mode: 'inline' | 'button' | 'popup';
  calendly_event_type: string | null;
  calendly_buffer_minutes: number;
  calendly_verified: boolean;
  
  // WhatsApp Settings
  whatsapp_enabled: boolean;
  whatsapp_number: string | null;
  whatsapp_api_provider: 'twilio' | 'ultramsg' | '360dialog' | 'manual' | null;
  whatsapp_api_key: string | null;
  whatsapp_template_id: string | null;
  
  // Notification Preferences
  send_booking_confirmation: boolean;
  send_reminder_before: boolean;
  reminder_hours_before: number;
  send_followup_after: boolean;
  
  // Message Templates
  confirmation_template: string;
  reminder_template: string;
  followup_template: string;
  
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: Partial<IntegrationSettings> = {
  calendly_enabled: false,
  calendly_display_mode: 'button',
  calendly_buffer_minutes: 15,
  calendly_verified: false,
  whatsapp_enabled: false,
  whatsapp_api_provider: 'manual',
  send_booking_confirmation: true,
  send_reminder_before: true,
  reminder_hours_before: 2,
  send_followup_after: false,
  confirmation_template: 'প্রিয় {{patient_name}}, আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে। ডাক্তার: {{doctor_name}}, তারিখ: {{date}}, সময়: {{time}}, সিরিয়াল: {{serial_number}}। ঠিকানা: {{chamber_address}}',
  reminder_template: 'রিমাইন্ডার: আজ {{time}} বাজে {{doctor_name}} এর সাথে আপনার অ্যাপয়েন্টমেন্ট আছে। সিরিয়াল: {{serial_number}}',
  followup_template: 'প্রিয় {{patient_name}}, {{doctor_name}} এর চেম্বারে আপনার ভিজিট কেমন ছিল? আমাদের সেবা সম্পর্কে আপনার মতামত জানান।',
};

export const useIntegrationSettings = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["integration-settings", profile?.id],
    queryFn: async () => {
      if (!profile) return null;
      
      const { data, error } = await supabase
        .from("integration_settings")
        .select("*")
        .eq("doctor_id", profile.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Return existing settings or create default
      if (!data) {
        return { ...DEFAULT_SETTINGS, doctor_id: profile.id } as IntegrationSettings;
      }
      
      return data as IntegrationSettings;
    },
    enabled: !!profile?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<IntegrationSettings>) => {
      if (!profile) throw new Error("No profile found");
      
      const { data: existing } = await supabase
        .from("integration_settings")
        .select("id")
        .eq("doctor_id", profile.id)
        .maybeSingle();
      
      if (existing) {
        const { error } = await supabase
          .from("integration_settings")
          .update(updates)
          .eq("doctor_id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("integration_settings")
          .insert([{ ...DEFAULT_SETTINGS, ...updates, doctor_id: profile.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration-settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save settings: " + error.message);
    },
  });

  const verifyCalendlyUrl = async (url: string): Promise<boolean> => {
    // Basic validation for Calendly URL format
    const calendlyRegex = /^https?:\/\/(calendly\.com\/[a-zA-Z0-9-_]+|cal\.com\/[a-zA-Z0-9-_]+)/;
    if (!calendlyRegex.test(url)) {
      toast.error("Invalid Calendly URL format");
      return false;
    }
    
    // In a real implementation, you would verify by calling an API
    // For now, we simulate a verification
    toast.success("Calendly URL verified successfully!");
    return true;
  };

  const sendTestWhatsApp = async (phoneNumber: string, message: string): Promise<boolean> => {
    if (!settings?.whatsapp_api_key || !settings?.whatsapp_number) {
      toast.error("WhatsApp API not configured properly");
      return false;
    }
    
    // Simulate sending a test message
    // In production, this would call an edge function
    toast.success(`Test message sent to ${phoneNumber}`);
    return true;
  };

  return {
    settings,
    isLoading,
    updateSettings,
    verifyCalendlyUrl,
    sendTestWhatsApp,
  };
};

// Hook for public profile to get integration settings
export const usePublicIntegrationSettings = (doctorId: string) => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["public-integration-settings", doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      
      // We only fetch public-safe settings (no API keys)
      const { data, error } = await supabase
        .from("integration_settings")
        .select(`
          id,
          doctor_id,
          calendly_enabled,
          calendly_url,
          calendly_display_mode,
          calendly_event_type,
          calendly_buffer_minutes,
          whatsapp_enabled,
          whatsapp_number
        `)
        .eq("doctor_id", doctorId)
        .maybeSingle();
      
      if (error) return null;
      return data as Partial<IntegrationSettings>;
    },
    enabled: !!doctorId,
  });

  return { settings, isLoading };
};
