-- Fix: Allow public users to check if patient exists for public doctors
CREATE POLICY "Public can check existing patients for public doctors" 
ON public.patients 
FOR SELECT 
USING (doctor_id IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.is_public = true)));

-- Fix: Allow public users to create queue tokens for sessions with booking open
-- Update existing policy to also check booking_open
DROP POLICY IF EXISTS "Anyone can add tokens to active sessions or public doctors" ON public.queue_tokens;

CREATE POLICY "Anyone can add tokens to active sessions with booking open" 
ON public.queue_tokens 
FOR INSERT 
WITH CHECK (
  -- Option 1: Session exists, is active, booking is open, and doctor is public
  (
    (session_id IS NOT NULL) AND 
    (session_id IN ( 
      SELECT queue_sessions.id
      FROM queue_sessions
      WHERE (
        (queue_sessions.status = ANY (ARRAY['open'::text, 'running'::text, 'paused'::text])) 
        AND (queue_sessions.booking_open = true)
        AND (queue_sessions.doctor_id IN ( 
          SELECT profiles.id FROM profiles WHERE (profiles.is_public = true)
        ))
      )
    ))
  ) 
  OR 
  -- Option 2: No session, but doctor is public and chamber belongs to them
  (
    (session_id IS NULL) AND 
    (doctor_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.is_public = true))) AND 
    (chamber_id IN ( SELECT chambers.id FROM chambers WHERE (chambers.doctor_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.is_public = true)))))
  ) 
  OR 
  -- Option 3: Doctor inserting their own tokens
  (doctor_id IN ( SELECT profiles.id FROM profiles WHERE (profiles.user_id = auth.uid())))
);