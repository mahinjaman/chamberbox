-- Create subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('basic', 'pro', 'premium');

-- Create profiles table for doctors
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  bmdc_number TEXT,
  chamber_address TEXT,
  subscription_tier subscription_tier DEFAULT 'basic',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT,
  address TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create visits table
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  symptoms TEXT,
  diagnosis TEXT,
  advice TEXT,
  medicines JSONB DEFAULT '[]'::jsonb,
  fees DECIMAL(10, 2) DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('paid', 'due', 'partial')) DEFAULT 'due',
  next_visit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create queue/tokens table for daily appointments
CREATE TABLE public.queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  token_number INTEGER NOT NULL,
  queue_date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'current', 'completed', 'cancelled')) DEFAULT 'waiting',
  estimated_time TIME,
  called_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(doctor_id, queue_date, token_number)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_tokens ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Patients policies (doctors can only access their own patients)
CREATE POLICY "Doctors can view own patients"
  ON public.patients FOR SELECT
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert patients"
  ON public.patients FOR INSERT
  WITH CHECK (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own patients"
  ON public.patients FOR UPDATE
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own patients"
  ON public.patients FOR DELETE
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Visits policies
CREATE POLICY "Doctors can view own visits"
  ON public.visits FOR SELECT
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert visits"
  ON public.visits FOR INSERT
  WITH CHECK (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own visits"
  ON public.visits FOR UPDATE
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own visits"
  ON public.visits FOR DELETE
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Queue tokens policies
CREATE POLICY "Doctors can view own queue"
  ON public.queue_tokens FOR SELECT
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert queue tokens"
  ON public.queue_tokens FOR INSERT
  WITH CHECK (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own queue"
  ON public.queue_tokens FOR UPDATE
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own queue tokens"
  ON public.queue_tokens FOR DELETE
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();