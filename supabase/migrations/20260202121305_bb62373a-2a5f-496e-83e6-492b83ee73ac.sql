-- Drop existing trigger that only handles session-based token generation
DROP TRIGGER IF EXISTS generate_session_token_trigger ON public.queue_tokens;

-- Create improved trigger function that handles both session and date-based token generation
CREATE OR REPLACE FUNCTION public.generate_queue_token_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_token INTEGER;
BEGIN
  -- Lock to prevent race conditions
  -- Get next token number for this doctor on this date for this chamber
  SELECT COALESCE(MAX(token_number), 0) + 1 INTO next_token
  FROM public.queue_tokens
  WHERE doctor_id = NEW.doctor_id
    AND queue_date = NEW.queue_date
    AND chamber_id = NEW.chamber_id
  FOR UPDATE;
  
  NEW.token_number := next_token;
  RETURN NEW;
END;
$function$;

-- Create trigger that fires BEFORE INSERT to set token number
CREATE TRIGGER generate_queue_token_trigger
  BEFORE INSERT ON public.queue_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_queue_token_number();