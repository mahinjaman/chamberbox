-- Fix all public-facing RLS policies to be explicitly PERMISSIVE and grant to anon role

-- 1. Fix profiles public access policy
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
CREATE POLICY "Anyone can view public profiles" 
  ON public.profiles 
  FOR SELECT 
  TO anon, authenticated
  USING (is_public = true);

-- 2. Fix chambers public access policy  
DROP POLICY IF EXISTS "Anyone can view chambers of public profiles" ON public.chambers;
CREATE POLICY "Anyone can view chambers of public profiles" 
  ON public.chambers 
  FOR SELECT 
  TO anon, authenticated
  USING (doctor_id IN (SELECT id FROM profiles WHERE is_public = true));

-- 3. Fix availability_slots public access policy
DROP POLICY IF EXISTS "Anyone can view availability of public profiles" ON public.availability_slots;
CREATE POLICY "Anyone can view availability of public profiles" 
  ON public.availability_slots 
  FOR SELECT 
  TO anon, authenticated
  USING (chamber_id IN (
    SELECT c.id FROM chambers c 
    JOIN profiles p ON c.doctor_id = p.id 
    WHERE p.is_public = true
  ));

-- 4. Fix doctor_videos public access policy
DROP POLICY IF EXISTS "Public can view active videos" ON public.doctor_videos;
CREATE POLICY "Public can view active videos" 
  ON public.doctor_videos 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true AND doctor_id IN (SELECT id FROM profiles WHERE is_public = true));

-- 5. Fix queue_sessions public access policy
DROP POLICY IF EXISTS "Public can view open sessions of public doctors" ON public.queue_sessions;
CREATE POLICY "Public can view open sessions of public doctors" 
  ON public.queue_sessions 
  FOR SELECT 
  TO anon, authenticated
  USING (
    status IN ('open', 'running') 
    AND doctor_id IN (SELECT id FROM profiles WHERE is_public = true)
  );