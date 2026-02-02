-- Grant SELECT permission to anon role on staff_members table
-- This allows unauthenticated users to query pending invitations
GRANT SELECT ON public.staff_members TO anon;

-- Also ensure profiles table is accessible for the doctor name lookup
GRANT SELECT ON public.profiles TO anon;