
-- Drop the dependent view first
DROP VIEW IF EXISTS public_integration_settings;

-- Now drop Calendly columns
ALTER TABLE public.integration_settings
  DROP COLUMN IF EXISTS calendly_buffer_minutes,
  DROP COLUMN IF EXISTS calendly_display_mode,
  DROP COLUMN IF EXISTS calendly_enabled,
  DROP COLUMN IF EXISTS calendly_event_type,
  DROP COLUMN IF EXISTS calendly_url,
  DROP COLUMN IF EXISTS calendly_verified;
