-- Set default subscription_tier to 'trial' and 30 days expiry for new profiles
ALTER TABLE public.profiles 
  ALTER COLUMN subscription_tier SET DEFAULT 'trial';

-- Update the handle_new_user function to set 30-day trial period
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, subscription_tier, subscription_expires_at)
  VALUES (
    NEW.id,
    regexp_replace(
      LEFT(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)), 200),
      E'[\\x00-\\x1F\\x7F]', '', 'g'
    ),
    NEW.email,
    'trial',
    NOW() + INTERVAL '30 days'
  );
  RETURN NEW;
END;
$function$;