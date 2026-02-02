-- Fix the trigger function - cannot use FOR UPDATE with aggregate functions
-- Use advisory lock instead for concurrency control
CREATE OR REPLACE FUNCTION public.generate_queue_token_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_token INTEGER;
  lock_key BIGINT;
BEGIN
  -- Generate a unique lock key based on doctor_id, queue_date, and chamber_id
  lock_key := hashtext(NEW.doctor_id::text || NEW.queue_date::text || NEW.chamber_id::text);
  
  -- Acquire advisory lock to prevent race conditions
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Get next token number for this doctor on this date for this chamber
  SELECT COALESCE(MAX(token_number), 0) + 1 INTO next_token
  FROM public.queue_tokens
  WHERE doctor_id = NEW.doctor_id
    AND queue_date = NEW.queue_date
    AND chamber_id = NEW.chamber_id;
  
  NEW.token_number := next_token;
  RETURN NEW;
END;
$function$;