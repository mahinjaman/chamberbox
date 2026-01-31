-- Add RLS policy for public read access to limited integration settings fields
CREATE POLICY "Anyone can view public integration settings"
  ON public.integration_settings
  FOR SELECT
  USING (
    doctor_id IN (
      SELECT id FROM profiles WHERE is_public = true
    )
  );