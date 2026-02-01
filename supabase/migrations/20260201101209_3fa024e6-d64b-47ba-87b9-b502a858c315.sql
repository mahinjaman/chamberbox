-- Fix existing overly permissive policy on appointments
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;

-- Create more restrictive appointment creation policies
CREATE POLICY "Authenticated users can create appointments for their patients"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = doctor_id AND user_id = auth.uid()
    )
  );

-- Allow public appointment creation with rate limiting (handled by trigger)
CREATE POLICY "Public can create appointments"
  ON public.appointments FOR INSERT
  TO anon
  WITH CHECK (doctor_id IS NOT NULL AND chamber_id IS NOT NULL);