-- Fix doctor_videos RLS policy to include anon role for public access
DROP POLICY IF EXISTS "Public can view active videos" ON public.doctor_videos;
CREATE POLICY "Public can view active videos" 
  ON public.doctor_videos 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true AND doctor_id IN (SELECT id FROM profiles WHERE is_public = true));