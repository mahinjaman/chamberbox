-- Drop the old policy that only allows viewing open/running sessions
DROP POLICY IF EXISTS "Public can view open sessions of public doctors" ON public.queue_sessions;

-- Create new policy that includes paused sessions for public viewing
CREATE POLICY "Public can view active sessions of public doctors"
ON public.queue_sessions
FOR SELECT
USING (
  status IN ('open', 'running', 'paused')
  AND doctor_id IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.is_public = true
  )
);