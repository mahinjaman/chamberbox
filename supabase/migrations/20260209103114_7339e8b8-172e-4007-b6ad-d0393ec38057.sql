-- Allow anonymous users to check approval status by doctor_code
CREATE POLICY "Anon can check approval status by doctor_code"
ON public.profiles
FOR SELECT
USING (
  doctor_code IS NOT NULL
  AND auth.role() = 'anon'
);