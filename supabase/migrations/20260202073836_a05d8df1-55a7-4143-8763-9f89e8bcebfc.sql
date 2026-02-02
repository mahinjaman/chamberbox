-- Create subscription_plans table for admin-configurable tier limits
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  
  -- Feature limits
  max_patients integer DEFAULT -1, -- -1 means unlimited
  max_staff integer DEFAULT 0,
  max_chambers integer DEFAULT 1,
  max_prescriptions_per_month integer DEFAULT -1,
  sms_credits integer DEFAULT 0,
  
  -- Feature flags
  can_use_public_profile boolean DEFAULT false,
  can_use_queue_booking boolean DEFAULT false,
  can_use_whatsapp_notifications boolean DEFAULT false,
  can_use_analytics boolean DEFAULT false,
  can_export_data boolean DEFAULT false,
  can_use_custom_branding boolean DEFAULT false,
  
  -- Pricing info (for display)
  price_monthly numeric DEFAULT 0,
  price_yearly numeric DEFAULT 0,
  currency text DEFAULT 'BDT',
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can read plans (for display purposes)
CREATE POLICY "Anyone can view subscription plans"
ON public.subscription_plans FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage subscription plans"
ON public.subscription_plans FOR ALL
USING (is_admin(auth.uid()));

-- Create usage tracking table
CREATE TABLE public.subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Monthly counters (reset monthly)
  patients_added_this_month integer DEFAULT 0,
  prescriptions_this_month integer DEFAULT 0,
  sms_sent_this_month integer DEFAULT 0,
  
  -- Reset tracking
  current_month date DEFAULT date_trunc('month', CURRENT_DATE)::date,
  
  -- Lifetime stats
  total_patients integer DEFAULT 0,
  total_prescriptions integer DEFAULT 0,
  total_sms_sent integer DEFAULT 0,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(doctor_id)
);

-- Enable RLS
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Doctors can view own usage
CREATE POLICY "Doctors can view own usage"
ON public.subscription_usage FOR SELECT
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- System updates usage (via triggers)
CREATE POLICY "System can manage usage"
ON public.subscription_usage FOR ALL
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Admins can view all usage
CREATE POLICY "Admins can view all usage"
ON public.subscription_usage FOR SELECT
USING (is_admin(auth.uid()));

-- Insert default subscription plans
INSERT INTO public.subscription_plans (tier, name, description, max_patients, max_staff, max_chambers, max_prescriptions_per_month, sms_credits, can_use_public_profile, can_use_queue_booking, can_use_whatsapp_notifications, can_use_analytics, can_export_data, can_use_custom_branding, price_monthly, price_yearly) VALUES
('trial', 'Trial', '90-day free trial with basic features', 50, 1, 1, 100, 20, true, true, false, false, false, false, 0, 0),
('basic', 'Basic', 'Essential features for solo practitioners', 100, 1, 1, 200, 50, true, true, false, true, false, false, 499, 4990),
('pro', 'Pro', 'Advanced features for growing practices', 500, 3, 2, -1, 200, true, true, true, true, true, false, 999, 9990),
('premium', 'Premium', 'Full features for established practices', -1, 10, 5, -1, 500, true, true, true, true, true, true, 1999, 19990),
('enterprise', 'Enterprise', 'Unlimited everything for large organizations', -1, -1, -1, -1, -1, true, true, true, true, true, true, 4999, 49990);

-- Function to auto-create usage record for new doctors
CREATE OR REPLACE FUNCTION public.create_usage_record_for_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscription_usage (doctor_id)
  VALUES (NEW.id)
  ON CONFLICT (doctor_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create usage record
CREATE TRIGGER create_usage_on_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_usage_record_for_new_profile();

-- Function to reset monthly counters
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.subscription_usage
  SET 
    patients_added_this_month = 0,
    prescriptions_this_month = 0,
    sms_sent_this_month = 0,
    current_month = date_trunc('month', CURRENT_DATE)::date,
    updated_at = now()
  WHERE current_month < date_trunc('month', CURRENT_DATE)::date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to increment patient count
CREATE OR REPLACE FUNCTION public.increment_patient_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- First ensure monthly reset
  PERFORM reset_monthly_usage();
  
  -- Increment counters
  INSERT INTO public.subscription_usage (doctor_id, patients_added_this_month, total_patients)
  VALUES (NEW.doctor_id, 1, 1)
  ON CONFLICT (doctor_id) DO UPDATE SET
    patients_added_this_month = subscription_usage.patients_added_this_month + 1,
    total_patients = subscription_usage.total_patients + 1,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for patient additions
CREATE TRIGGER track_patient_usage
AFTER INSERT ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.increment_patient_usage();

-- Function to increment prescription count
CREATE OR REPLACE FUNCTION public.increment_prescription_usage()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM reset_monthly_usage();
  
  INSERT INTO public.subscription_usage (doctor_id, prescriptions_this_month, total_prescriptions)
  VALUES (NEW.doctor_id, 1, 1)
  ON CONFLICT (doctor_id) DO UPDATE SET
    prescriptions_this_month = subscription_usage.prescriptions_this_month + 1,
    total_prescriptions = subscription_usage.total_prescriptions + 1,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for prescription additions
CREATE TRIGGER track_prescription_usage
AFTER INSERT ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.increment_prescription_usage();

-- Create usage records for existing doctors
INSERT INTO public.subscription_usage (doctor_id, total_patients, total_prescriptions)
SELECT 
  p.id,
  (SELECT COUNT(*) FROM patients WHERE doctor_id = p.id),
  (SELECT COUNT(*) FROM prescriptions WHERE doctor_id = p.id)
FROM profiles p
ON CONFLICT (doctor_id) DO NOTHING;