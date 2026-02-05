-- Add notes column to queue_tokens for internal notes
ALTER TABLE public.queue_tokens
ADD COLUMN notes TEXT;