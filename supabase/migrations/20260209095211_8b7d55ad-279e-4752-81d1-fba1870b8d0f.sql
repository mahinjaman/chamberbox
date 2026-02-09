
-- Add approval_status column: 'pending', 'approved', 'rejected', 'spam'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';

-- Set existing data
UPDATE public.profiles SET approval_status = 'approved' WHERE is_approved = true;
UPDATE public.profiles SET approval_status = 'spam' WHERE is_approved = false AND admin_notes = 'Marked as spam';
