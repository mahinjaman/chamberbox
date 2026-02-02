-- Allow public/anonymous users to create patients for public doctors (required for public booking)
CREATE POLICY "Public can create patients for public doctors"
ON public.patients
FOR INSERT
WITH CHECK (
  doctor_id IN (
    SELECT id FROM public.profiles 
    WHERE is_public = true
  )
);