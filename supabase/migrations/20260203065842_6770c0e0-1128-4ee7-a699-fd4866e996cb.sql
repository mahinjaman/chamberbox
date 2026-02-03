-- Drop and recreate patients policies for anon role specifically
DROP POLICY IF EXISTS "Public can create patients for public doctors" ON public.patients;
DROP POLICY IF EXISTS "Public can check existing patients for public doctors" ON public.patients;

-- Create explicit anon INSERT policy for patients
CREATE POLICY "Anon can create patients for public doctors" 
ON public.patients 
FOR INSERT 
TO anon
WITH CHECK (
  doctor_id IN (
    SELECT id FROM public.profiles WHERE is_public = true
  )
);

-- Create explicit anon SELECT policy for patients (needed to check if patient exists)
CREATE POLICY "Anon can check existing patients for public doctors" 
ON public.patients 
FOR SELECT 
TO anon
USING (
  doctor_id IN (
    SELECT id FROM public.profiles WHERE is_public = true
  )
);