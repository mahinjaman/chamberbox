
-- Platform-level SMS gateway configuration (managed by admin)
CREATE TABLE public.platform_sms_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway_name TEXT NOT NULL, -- e.g., 'bulksmsbd', 'smsq', 'greenweb', 'bdbulksms', 'elitbuzz'
  display_name TEXT NOT NULL,
  api_url TEXT NOT NULL,
  api_key TEXT,
  sender_id TEXT,
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_sms_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage
CREATE POLICY "Admins can view platform SMS config"
ON public.platform_sms_config FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert platform SMS config"
ON public.platform_sms_config FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update platform SMS config"
ON public.platform_sms_config FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete platform SMS config"
ON public.platform_sms_config FOR DELETE
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_platform_sms_config_updated_at
BEFORE UPDATE ON public.platform_sms_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
