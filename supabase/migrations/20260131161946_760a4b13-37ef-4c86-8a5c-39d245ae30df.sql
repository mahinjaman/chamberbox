-- Add new columns to profiles table for public doctor profile
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cover_photo_url text,
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS services text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS degrees text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{Bangla}',
ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS patient_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating numeric(2,1) DEFAULT 0.0;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug) WHERE slug IS NOT NULL;

-- Create chambers table for multiple chamber locations
CREATE TABLE public.chambers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  location_lat numeric(10,7),
  location_lng numeric(10,7),
  contact_number text,
  new_patient_fee numeric DEFAULT 500,
  return_patient_fee numeric DEFAULT 300,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on chambers
ALTER TABLE public.chambers ENABLE ROW LEVEL SECURITY;

-- Chambers policies
CREATE POLICY "Doctors can view own chambers" ON public.chambers
  FOR SELECT USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert chambers" ON public.chambers
  FOR INSERT WITH CHECK (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own chambers" ON public.chambers
  FOR UPDATE USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own chambers" ON public.chambers
  FOR DELETE USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Public can view chambers for public profiles
CREATE POLICY "Anyone can view chambers of public profiles" ON public.chambers
  FOR SELECT USING (doctor_id IN (SELECT id FROM profiles WHERE is_public = true));

-- Create availability_slots table
CREATE TABLE public.availability_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chamber_id uuid NOT NULL REFERENCES public.chambers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  slot_duration_minutes integer DEFAULT 15,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on availability_slots
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- Availability policies
CREATE POLICY "Doctors can manage own availability" ON public.availability_slots
  FOR ALL USING (chamber_id IN (
    SELECT c.id FROM chambers c 
    JOIN profiles p ON c.doctor_id = p.id 
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view availability of public profiles" ON public.availability_slots
  FOR SELECT USING (chamber_id IN (
    SELECT c.id FROM chambers c 
    JOIN profiles p ON c.doctor_id = p.id 
    WHERE p.is_public = true
  ));

-- Create appointments table
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chamber_id uuid NOT NULL REFERENCES public.chambers(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_phone text NOT NULL,
  patient_age integer,
  patient_gender text,
  symptoms text,
  is_follow_up boolean DEFAULT false,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  token_number integer NOT NULL,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
  fee numeric NOT NULL,
  payment_method text DEFAULT 'cash',
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Doctors can view their appointments
CREATE POLICY "Doctors can view own appointments" ON public.appointments
  FOR SELECT USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own appointments" ON public.appointments
  FOR UPDATE USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Anyone can create appointments (public booking)
CREATE POLICY "Anyone can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

-- Create function to generate token number
CREATE OR REPLACE FUNCTION public.generate_appointment_token()
RETURNS TRIGGER AS $$
DECLARE
  next_token integer;
BEGIN
  SELECT COALESCE(MAX(token_number), 0) + 1 INTO next_token
  FROM public.appointments
  WHERE doctor_id = NEW.doctor_id
    AND appointment_date = NEW.appointment_date;
  
  NEW.token_number := next_token;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto token number
CREATE TRIGGER set_appointment_token
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_appointment_token();

-- Add trigger for updated_at on chambers
CREATE TRIGGER update_chambers_updated_at
  BEFORE UPDATE ON public.chambers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on appointments
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();