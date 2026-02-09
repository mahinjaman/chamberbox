
-- Add admin_notes column to profiles for admin-only notes on doctors
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_notes text;
