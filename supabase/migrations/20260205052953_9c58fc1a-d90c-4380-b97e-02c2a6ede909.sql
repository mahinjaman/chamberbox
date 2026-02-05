-- Update handle_new_user to save phone from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone, subscription_tier, subscription_expires_at)
  VALUES (
    NEW.id,
    regexp_replace(
      LEFT(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)), 200),
      E'[\\x00-\\x1F\\x7F]', '', 'g'
    ),
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'phone' ~ '^01[0-9]{9}$' 
      THEN NEW.raw_user_meta_data->>'phone'
      ELSE NULL
    END,
    'trial',
    NOW() + INTERVAL '30 days'
  );
  RETURN NEW;
END;
$function$;