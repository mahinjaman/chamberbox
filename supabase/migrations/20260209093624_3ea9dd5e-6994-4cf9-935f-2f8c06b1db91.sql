
-- Update handle_new_user to generate a unique doctor_code on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _doctor_code TEXT;
BEGIN
  -- Generate unique doctor code: CB + 6 random digits
  LOOP
    _doctor_code := 'CB' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE doctor_code = _doctor_code);
  END LOOP;

  INSERT INTO public.profiles (user_id, full_name, email, phone, subscription_tier, subscription_expires_at, is_approved, doctor_code)
  VALUES (
    NEW.id,
    LEFT(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)), 200),
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'phone' ~ '^01[0-9]{9}$' 
      THEN NEW.raw_user_meta_data->>'phone'
      ELSE NULL
    END,
    'trial',
    NOW() + INTERVAL '30 days',
    false,
    _doctor_code
  );
  RETURN NEW;
END;
$function$;
