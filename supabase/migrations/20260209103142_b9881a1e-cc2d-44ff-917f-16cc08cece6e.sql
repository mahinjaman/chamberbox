-- Drop the overly broad policy
DROP POLICY "Anon can check approval status by doctor_code" ON public.profiles;

-- Create a database function for anon status check instead
CREATE OR REPLACE FUNCTION public.check_doctor_approval_status(_doctor_code TEXT)
RETURNS TABLE(full_name TEXT, is_approved BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.full_name, p.is_approved
  FROM public.profiles p
  WHERE p.doctor_code = UPPER(_doctor_code)
  LIMIT 1;
$$;