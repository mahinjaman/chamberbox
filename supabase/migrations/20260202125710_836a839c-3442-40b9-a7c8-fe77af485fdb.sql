-- Add booking_open column to queue_sessions table
ALTER TABLE public.queue_sessions 
ADD COLUMN booking_open BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN public.queue_sessions.booking_open IS 'Controls whether public booking is allowed for this session';