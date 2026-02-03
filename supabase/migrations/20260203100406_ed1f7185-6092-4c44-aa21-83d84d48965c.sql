-- Add is_active column to chambers table for manual control
-- This allows doctors to choose which chambers remain active within their plan limits
ALTER TABLE public.chambers 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update comment for clarity
COMMENT ON COLUMN public.chambers.is_active IS 'Doctor-controlled toggle to activate/deactivate chambers. Inactive chambers are excluded from booking, public profiles, and session creation.';