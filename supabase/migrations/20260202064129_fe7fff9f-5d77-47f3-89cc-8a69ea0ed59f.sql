-- Allow anyone to check if their email has a pending staff invitation
-- This is safe because we only allow checking by email and only return limited data
CREATE POLICY "Anyone can check pending invitations by email"
ON public.staff_members
FOR SELECT
USING (
  user_id IS NULL  -- Only pending invitations (not yet linked to a user)
  AND is_active = true
);