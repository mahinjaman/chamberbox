-- Add phone format validation constraints (Bangladeshi format: 01XXXXXXXXX)
-- Using a trigger instead of CHECK constraint to avoid immutability issues

-- Create validation function for phone numbers
CREATE OR REPLACE FUNCTION public.validate_phone_format()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow NULL phone numbers
  IF NEW.phone IS NOT NULL THEN
    -- Validate Bangladeshi phone format (01 followed by 9 digits)
    IF NEW.phone !~ '^01[0-9]{9}$' THEN
      RAISE EXCEPTION 'Invalid phone format. Use Bangladeshi format: 01XXXXXXXXX';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply to patients table
DROP TRIGGER IF EXISTS validate_patients_phone ON public.patients;
CREATE TRIGGER validate_patients_phone
  BEFORE INSERT OR UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_phone_format();

-- Apply to profiles table
DROP TRIGGER IF EXISTS validate_profiles_phone ON public.profiles;
CREATE TRIGGER validate_profiles_phone
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_phone_format();

-- Update handle_new_user to sanitize and validate input
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    -- Sanitize: trim whitespace, limit to 200 chars, remove control characters
    regexp_replace(
      LEFT(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)), 200),
      E'[\\x00-\\x1F\\x7F]', '', 'g'
    ),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;