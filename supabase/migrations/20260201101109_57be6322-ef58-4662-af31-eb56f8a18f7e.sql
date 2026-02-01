-- Fix permissive RLS policy for video_tutorials - make it more specific
DROP POLICY IF EXISTS "Anyone can view active tutorials" ON public.video_tutorials;

CREATE POLICY "Public can view active tutorials"
  ON public.video_tutorials FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Also add unauthenticated access for support ticket creation
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;

CREATE POLICY "Authenticated users can create tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow public ticket creation without auth (for landing page support)
CREATE POLICY "Public can create tickets"
  ON public.support_tickets FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);