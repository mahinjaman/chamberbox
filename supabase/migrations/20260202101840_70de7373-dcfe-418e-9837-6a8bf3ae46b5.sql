-- Drop the old policy that only allows open/running sessions
DROP POLICY IF EXISTS "Anyone can add tokens to open sessions" ON public.queue_tokens;

-- Create new policy that includes paused sessions (doctors may pause but still accept advance bookings)
CREATE POLICY "Anyone can add tokens to active sessions"
ON public.queue_tokens
FOR INSERT
WITH CHECK (
  (session_id IN (
    SELECT queue_sessions.id
    FROM queue_sessions
    WHERE (
      queue_sessions.status = ANY (ARRAY['open'::text, 'running'::text, 'paused'::text])
    ) AND (
      queue_sessions.doctor_id IN (
        SELECT profiles.id
        FROM profiles
        WHERE profiles.is_public = true
      )
    )
  )) OR (
    doctor_id IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  )
);