-- Allow staff to link their own account on first login
-- They can only update their own record when:
-- 1. The record has no user_id yet (pending invitation)
-- 2. The email matches their auth email
CREATE POLICY "Staff can link own account on first login"
ON public.staff_members
FOR UPDATE
USING (
  user_id IS NULL 
  AND LOWER(email) = LOWER(auth.email())
)
WITH CHECK (
  user_id = auth.uid()
  AND accepted_at IS NOT NULL
);