-- Fix RLS policies to allow anonymous users to view public profiles
-- Drop and recreate the public profile viewing policy to include anon role

DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
CREATE POLICY "Anyone can view public profiles" 
  ON public.profiles 
  FOR SELECT 
  TO anon, authenticated
  USING (is_public = true);

-- Also ensure chambers are accessible for public profiles by anon users
DROP POLICY IF EXISTS "Anyone can view chambers of public profiles" ON public.chambers;
CREATE POLICY "Anyone can view chambers of public profiles" 
  ON public.chambers 
  FOR SELECT 
  TO anon, authenticated
  USING (doctor_id IN (SELECT id FROM profiles WHERE is_public = true));

-- Also ensure availability slots are accessible for public profiles by anon users
DROP POLICY IF EXISTS "Anyone can view availability of public profiles" ON public.availability_slots;
CREATE POLICY "Anyone can view availability of public profiles" 
  ON public.availability_slots 
  FOR SELECT 
  TO anon, authenticated
  USING (chamber_id IN (SELECT c.id FROM chambers c JOIN profiles p ON c.doctor_id = p.id WHERE p.is_public = true));