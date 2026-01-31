-- Create integration_settings table for Calendly and WhatsApp configurations
CREATE TABLE public.integration_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Calendly Settings
  calendly_enabled BOOLEAN DEFAULT false,
  calendly_url TEXT,
  calendly_display_mode TEXT DEFAULT 'button' CHECK (calendly_display_mode IN ('inline', 'button', 'popup')),
  calendly_event_type TEXT,
  calendly_buffer_minutes INTEGER DEFAULT 15,
  calendly_verified BOOLEAN DEFAULT false,
  
  -- WhatsApp Settings
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  whatsapp_api_provider TEXT CHECK (whatsapp_api_provider IN ('twilio', 'ultramsg', '360dialog', 'manual')),
  whatsapp_api_key TEXT,
  whatsapp_template_id TEXT,
  
  -- Notification Preferences
  send_booking_confirmation BOOLEAN DEFAULT true,
  send_reminder_before BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 2,
  send_followup_after BOOLEAN DEFAULT false,
  
  -- Custom Message Templates
  confirmation_template TEXT DEFAULT 'প্রিয় {{patient_name}}, আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে। ডাক্তার: {{doctor_name}}, তারিখ: {{date}}, সময়: {{time}}, সিরিয়াল: {{serial_number}}। ঠিকানা: {{chamber_address}}',
  reminder_template TEXT DEFAULT 'রিমাইন্ডার: আজ {{time}} বাজে {{doctor_name}} এর সাথে আপনার অ্যাপয়েন্টমেন্ট আছে। সিরিয়াল: {{serial_number}}',
  followup_template TEXT DEFAULT 'প্রিয় {{patient_name}}, {{doctor_name}} এর চেম্বারে আপনার ভিজিট কেমন ছিল? আমাদের সেবা সম্পর্কে আপনার মতামত জানান।',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(doctor_id)
);

-- Enable RLS
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view own integration settings"
  ON public.integration_settings
  FOR SELECT
  USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert integration settings"
  ON public.integration_settings
  FOR INSERT
  WITH CHECK (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own integration settings"
  ON public.integration_settings
  FOR UPDATE
  USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_integration_settings_updated_at
  BEFORE UPDATE ON public.integration_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add pre_booking_info column to appointments for storing patient info before Calendly redirect
ALTER TABLE public.appointments 
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS calendly_event_id TEXT,
  ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;