-- Grant anon role access to patients table for public booking
GRANT SELECT, INSERT ON public.patients TO anon;

-- Grant anon role access to queue_tokens table for public booking  
GRANT SELECT, INSERT ON public.queue_tokens TO anon;