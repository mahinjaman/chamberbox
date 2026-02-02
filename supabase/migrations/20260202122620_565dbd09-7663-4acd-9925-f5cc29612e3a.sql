-- Fix the trigger function to generate token numbers per doctor+date (not per chamber)
-- This fixes the unique constraint violation on queue_tokens_doctor_id_queue_date_token_number_key

CREATE OR REPLACE FUNCTION public.generate_queue_token_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_token INTEGER;
  lock_key BIGINT;
BEGIN
  -- Acquire advisory lock based on doctor_id and queue_date only (not chamber)
  -- This prevents race conditions when multiple inserts happen simultaneously
  lock_key := hashtext(NEW.doctor_id::text || NEW.queue_date::text);
  PERFORM pg_advisory_xact_lock(lock_key);

  -- Get next token number for this doctor across ALL chambers for this date
  SELECT COALESCE(MAX(token_number), 0) + 1 INTO next_token
  FROM public.queue_tokens
  WHERE doctor_id = NEW.doctor_id
    AND queue_date = NEW.queue_date;

  -- Set the token number
  NEW.token_number := next_token;
  
  RETURN NEW;
END;
$$;

-- Ensure trigger exists and fires BEFORE INSERT
DROP TRIGGER IF EXISTS set_queue_token_number ON public.queue_tokens;

CREATE TRIGGER set_queue_token_number
  BEFORE INSERT ON public.queue_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_queue_token_number();