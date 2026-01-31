-- Revoke all public/anon access to sensitive tables
REVOKE ALL ON public.patients FROM anon;
REVOKE ALL ON public.visits FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.queue_tokens FROM anon;

-- Ensure RLS is enabled on all tables (idempotent)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_tokens ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners as well (extra security)
ALTER TABLE public.patients FORCE ROW LEVEL SECURITY;
ALTER TABLE public.visits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.queue_tokens FORCE ROW LEVEL SECURITY;

-- Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queue_tokens TO authenticated;