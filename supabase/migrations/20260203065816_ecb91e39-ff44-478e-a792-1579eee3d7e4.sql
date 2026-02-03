-- Drop the complex policy and create a simpler one for public booking
DROP POLICY IF EXISTS "Anyone can add tokens to active sessions with booking open" ON public.queue_tokens;

-- Create a cleaner policy for public booking that doesn't rely on auth.uid()
CREATE POLICY "Public can insert tokens for public doctors" 
ON public.queue_tokens 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- For session-based booking
  (
    session_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.queue_sessions qs
      JOIN public.profiles p ON qs.doctor_id = p.id
      WHERE qs.id = session_id
        AND qs.status IN ('open', 'running', 'paused')
        AND qs.booking_open = true
        AND p.is_public = true
    )
  )
  -- OR if user is authenticated and owns this doctor profile
  OR (
    auth.uid() IS NOT NULL 
    AND doctor_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- Also add a SELECT policy for anon to view queue_tokens for public doctors
CREATE POLICY "Public can view queue tokens for public doctors"
ON public.queue_tokens
FOR SELECT
TO anon
USING (
  doctor_id IN (
    SELECT id FROM public.profiles WHERE is_public = true
  )
);