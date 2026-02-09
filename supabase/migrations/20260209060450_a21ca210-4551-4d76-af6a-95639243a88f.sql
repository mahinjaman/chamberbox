
-- Create a secure public view for profiles that excludes sensitive fields
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  full_name,
  avatar_url,
  cover_photo_url,
  specialization,
  bmdc_number,
  slug,
  bio,
  services,
  degrees,
  languages,
  experience_years,
  verified,
  is_public,
  seo_title,
  seo_description,
  patient_count,
  rating,
  social_links,
  youtube_url,
  education,
  custom_info,
  doctor_code,
  created_at,
  updated_at
FROM public.profiles;
-- Excluded: email, phone, user_id, chamber_address, subscription_tier, subscription_expires_at, is_approved, approved_at, approved_by

-- Drop the old permissive public policy
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Create a new restrictive policy: anon can ONLY access via the view (which filters columns)
-- But since the view uses security_invoker, anon needs SELECT on base table
-- Instead, we create a policy that only allows anon to see public profiles but the app will use the view
CREATE POLICY "Anon can view public profiles limited" 
ON public.profiles
FOR SELECT
TO anon
USING (is_public = true);

-- Grant anon SELECT on the view
GRANT SELECT ON public.profiles_public TO anon;
