-- Grant anon SELECT access for RLS subqueries to function during public booking
GRANT SELECT ON public.queue_sessions TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.chambers TO anon;