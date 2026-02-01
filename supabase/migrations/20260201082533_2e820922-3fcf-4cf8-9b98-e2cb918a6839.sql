-- =====================================================
-- SECURITY FIX: Address 3 error-level security issues
-- =====================================================

-- 1. FIX: integration_settings API keys exposure
-- Drop the overly permissive policy that exposes whatsapp_api_key
DROP POLICY IF EXISTS "Anyone can view public integration settings" ON public.integration_settings;

-- Create a secure view that only exposes safe fields for public profiles
CREATE OR REPLACE VIEW public.public_integration_settings 
WITH (security_invoker = on) AS
SELECT 
  id,
  doctor_id,
  calendly_enabled,
  calendly_url,
  calendly_display_mode,
  calendly_event_type,
  calendly_buffer_minutes,
  whatsapp_enabled,
  whatsapp_number
FROM public.integration_settings
WHERE doctor_id IN (SELECT id FROM profiles WHERE is_public = true);

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_integration_settings TO anon, authenticated;

-- 2. FIX: profiles_no_public_select - Allow viewing public profiles
-- Add a policy for anonymous users to view public profiles
CREATE POLICY "Anyone can view public profiles"
  ON public.profiles
  FOR SELECT
  USING (is_public = true);

-- 3. FIX: appointments_anonymous_insert - Add rate limiting
-- Create a function to enforce rate limits on appointment creation
CREATE OR REPLACE FUNCTION public.check_appointment_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count appointments from same phone in last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.appointments
  WHERE patient_phone = NEW.patient_phone
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Maximum 5 appointments per hour per phone number.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce rate limiting
DROP TRIGGER IF EXISTS enforce_appointment_rate_limit ON public.appointments;
CREATE TRIGGER enforce_appointment_rate_limit
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_appointment_rate_limit();

-- Add phone validation trigger for appointments table (similar to patients)
CREATE OR REPLACE FUNCTION public.validate_appointment_phone()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate Bangladeshi phone format (01 followed by 9 digits)
  IF NEW.patient_phone IS NOT NULL THEN
    IF NEW.patient_phone !~ '^01[0-9]{9}$' THEN
      RAISE EXCEPTION 'Invalid phone format. Use Bangladeshi format: 01XXXXXXXXX';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS validate_appointments_phone ON public.appointments;
CREATE TRIGGER validate_appointments_phone
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_appointment_phone();

-- Add DELETE policy for doctors to manage their appointments
CREATE POLICY "Doctors can delete own appointments"
  ON public.appointments
  FOR DELETE
  USING (
    doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );