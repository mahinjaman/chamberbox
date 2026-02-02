-- Create enum for staff roles
CREATE TYPE public.staff_role AS ENUM ('receptionist', 'assistant', 'manager');

-- Create staff_members table - stores staff invited by doctors
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role staff_role NOT NULL DEFAULT 'receptionist',
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(doctor_id, email)
);

-- Create staff_chamber_access table - which chambers a staff can access
CREATE TABLE public.staff_chamber_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  chamber_id UUID NOT NULL REFERENCES public.chambers(id) ON DELETE CASCADE,
  can_manage_queue BOOLEAN DEFAULT true,
  can_view_prescriptions BOOLEAN DEFAULT true,
  can_manage_patients BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(staff_id, chamber_id)
);

-- Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_chamber_access ENABLE ROW LEVEL SECURITY;

-- Function to check if user is staff of a doctor
CREATE OR REPLACE FUNCTION public.is_staff_of(_user_id UUID, _doctor_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_members
    WHERE user_id = _user_id 
      AND doctor_id = _doctor_id
      AND is_active = true
  )
$$;

-- Function to get staff's doctor_id
CREATE OR REPLACE FUNCTION public.get_staff_doctor_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT doctor_id FROM public.staff_members
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1
$$;

-- Function to check if staff has chamber access
CREATE OR REPLACE FUNCTION public.staff_has_chamber_access(_user_id UUID, _chamber_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_chamber_access sca
    JOIN public.staff_members sm ON sca.staff_id = sm.id
    WHERE sm.user_id = _user_id 
      AND sm.is_active = true
      AND sca.chamber_id = _chamber_id
  )
$$;

-- RLS Policies for staff_members table

-- Doctors can view their own staff
CREATE POLICY "Doctors can view own staff"
ON public.staff_members FOR SELECT
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Doctors can insert staff
CREATE POLICY "Doctors can insert staff"
ON public.staff_members FOR INSERT
WITH CHECK (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Doctors can update their staff
CREATE POLICY "Doctors can update own staff"
ON public.staff_members FOR UPDATE
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Doctors can delete their staff
CREATE POLICY "Doctors can delete own staff"
ON public.staff_members FOR DELETE
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Staff can view their own record
CREATE POLICY "Staff can view own record"
ON public.staff_members FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies for staff_chamber_access table

-- Doctors can manage chamber access for their staff
CREATE POLICY "Doctors can view staff chamber access"
ON public.staff_chamber_access FOR SELECT
USING (
  staff_id IN (
    SELECT id FROM staff_members 
    WHERE doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Doctors can insert staff chamber access"
ON public.staff_chamber_access FOR INSERT
WITH CHECK (
  staff_id IN (
    SELECT id FROM staff_members 
    WHERE doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Doctors can update staff chamber access"
ON public.staff_chamber_access FOR UPDATE
USING (
  staff_id IN (
    SELECT id FROM staff_members 
    WHERE doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Doctors can delete staff chamber access"
ON public.staff_chamber_access FOR DELETE
USING (
  staff_id IN (
    SELECT id FROM staff_members 
    WHERE doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

-- Staff can view their own chamber access
CREATE POLICY "Staff can view own chamber access"
ON public.staff_chamber_access FOR SELECT
USING (
  staff_id IN (SELECT id FROM staff_members WHERE user_id = auth.uid())
);

-- Add RLS policies for staff to access patients/queue of their assigned doctor's chambers

-- Staff can view patients of their doctor
CREATE POLICY "Staff can view doctor patients"
ON public.patients FOR SELECT
USING (
  doctor_id IN (
    SELECT doctor_id FROM staff_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Staff can insert patients for their doctor
CREATE POLICY "Staff can insert patients"
ON public.patients FOR INSERT
WITH CHECK (
  doctor_id IN (
    SELECT doctor_id FROM staff_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Staff can update patients of their doctor
CREATE POLICY "Staff can update doctor patients"
ON public.patients FOR UPDATE
USING (
  doctor_id IN (
    SELECT doctor_id FROM staff_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Staff can view queue tokens for their accessible chambers
CREATE POLICY "Staff can view queue tokens"
ON public.queue_tokens FOR SELECT
USING (
  chamber_id IN (
    SELECT sca.chamber_id FROM staff_chamber_access sca
    JOIN staff_members sm ON sca.staff_id = sm.id
    WHERE sm.user_id = auth.uid() AND sm.is_active = true
  )
);

-- Staff can insert queue tokens for their accessible chambers
CREATE POLICY "Staff can insert queue tokens"
ON public.queue_tokens FOR INSERT
WITH CHECK (
  chamber_id IN (
    SELECT sca.chamber_id FROM staff_chamber_access sca
    JOIN staff_members sm ON sca.staff_id = sm.id
    WHERE sm.user_id = auth.uid() AND sm.is_active = true AND sca.can_manage_queue = true
  )
);

-- Staff can update queue tokens for their accessible chambers
CREATE POLICY "Staff can update queue tokens"
ON public.queue_tokens FOR UPDATE
USING (
  chamber_id IN (
    SELECT sca.chamber_id FROM staff_chamber_access sca
    JOIN staff_members sm ON sca.staff_id = sm.id
    WHERE sm.user_id = auth.uid() AND sm.is_active = true AND sca.can_manage_queue = true
  )
);

-- Staff can view queue sessions for their accessible chambers
CREATE POLICY "Staff can view queue sessions"
ON public.queue_sessions FOR SELECT
USING (
  chamber_id IN (
    SELECT sca.chamber_id FROM staff_chamber_access sca
    JOIN staff_members sm ON sca.staff_id = sm.id
    WHERE sm.user_id = auth.uid() AND sm.is_active = true
  )
);

-- Staff can view prescriptions (read only) for their doctor
CREATE POLICY "Staff can view prescriptions"
ON public.prescriptions FOR SELECT
USING (
  doctor_id IN (
    SELECT sm.doctor_id FROM staff_members sm
    JOIN staff_chamber_access sca ON sca.staff_id = sm.id
    WHERE sm.user_id = auth.uid() AND sm.is_active = true AND sca.can_view_prescriptions = true
  )
);

-- Staff can view chambers they have access to
CREATE POLICY "Staff can view assigned chambers"
ON public.chambers FOR SELECT
USING (
  id IN (
    SELECT sca.chamber_id FROM staff_chamber_access sca
    JOIN staff_members sm ON sca.staff_id = sm.id
    WHERE sm.user_id = auth.uid() AND sm.is_active = true
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_staff_members_updated_at
BEFORE UPDATE ON public.staff_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();