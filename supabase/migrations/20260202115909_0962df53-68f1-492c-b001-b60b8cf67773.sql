-- Add visiting_reason column to queue_tokens table
ALTER TABLE public.queue_tokens 
ADD COLUMN visiting_reason TEXT DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.queue_tokens.visiting_reason IS 'Optional reason for the visit provided during booking';