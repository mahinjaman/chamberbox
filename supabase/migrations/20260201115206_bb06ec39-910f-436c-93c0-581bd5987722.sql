-- Create doctor_videos table for multiple videos
CREATE TABLE public.doctor_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_intro BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctor_videos ENABLE ROW LEVEL SECURITY;

-- Create policies - doctors can manage their own videos
CREATE POLICY "Doctors can view their own videos"
  ON public.doctor_videos
  FOR SELECT
  USING (
    doctor_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can create their own videos"
  ON public.doctor_videos
  FOR INSERT
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their own videos"
  ON public.doctor_videos
  FOR UPDATE
  USING (
    doctor_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete their own videos"
  ON public.doctor_videos
  FOR DELETE
  USING (
    doctor_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Public can view active videos of public profiles
CREATE POLICY "Public can view active videos"
  ON public.doctor_videos
  FOR SELECT
  USING (
    is_active = true AND
    doctor_id IN (
      SELECT id FROM public.profiles WHERE is_public = true
    )
  );

-- Add YouTube to social_links if not already there (handled in code)
-- Also add trigger for updated_at
CREATE TRIGGER update_doctor_videos_updated_at
  BEFORE UPDATE ON public.doctor_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();