-- Drop the old triggers and recreate them properly
DROP TRIGGER IF EXISTS set_queue_token_number ON public.queue_tokens;
DROP TRIGGER IF EXISTS generate_session_token_trigger ON public.queue_tokens;

-- Fix the trigger function to generate token numbers per doctor+date ONLY
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

-- Create the trigger
CREATE TRIGGER set_queue_token_number
  BEFORE INSERT ON public.queue_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_queue_token_number();

-- Also update RLS policy to allow public booking even when session_id is NULL
-- Drop and recreate the public insert policy
DROP POLICY IF EXISTS "Anyone can add tokens to active sessions" ON public.queue_tokens;

CREATE POLICY "Anyone can add tokens to active sessions or public doctors" 
ON public.queue_tokens 
FOR INSERT 
WITH CHECK (
  -- Allow if session exists and is active
  (session_id IS NOT NULL AND session_id IN (
    SELECT id FROM public.queue_sessions
    WHERE status IN ('open', 'running', 'paused')
      AND doctor_id IN (SELECT id FROM public.profiles WHERE is_public = true)
  ))
  OR
  -- Allow if no session but doctor is public and chamber exists
  (session_id IS NULL AND doctor_id IN (
    SELECT id FROM public.profiles WHERE is_public = true
  ) AND chamber_id IN (
    SELECT id FROM public.chambers WHERE doctor_id IN (
      SELECT id FROM public.profiles WHERE is_public = true
    )
  ))
  OR 
  -- Allow doctor's own inserts
  (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);