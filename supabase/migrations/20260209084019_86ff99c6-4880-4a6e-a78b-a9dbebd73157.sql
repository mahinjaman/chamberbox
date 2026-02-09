-- Allow authenticated users to insert medicines
CREATE POLICY "Authenticated users can add medicines"
ON public.medicines
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to delete medicines
CREATE POLICY "Authenticated users can delete medicines"
ON public.medicines
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to update medicines
CREATE POLICY "Authenticated users can update medicines"
ON public.medicines
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);