
-- Create patient_notes table for internal doctor notes
CREATE TABLE public.patient_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;

-- Doctors can manage their own patient notes
CREATE POLICY "Doctors can view own patient notes"
  ON public.patient_notes FOR SELECT
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can create patient notes"
  ON public.patient_notes FOR INSERT
  WITH CHECK (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own patient notes"
  ON public.patient_notes FOR UPDATE
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own patient notes"
  ON public.patient_notes FOR DELETE
  USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Staff can also manage notes for their doctor's patients
CREATE POLICY "Staff can view doctor patient notes"
  ON public.patient_notes FOR SELECT
  USING (public.is_staff_of(auth.uid(), doctor_id));

CREATE POLICY "Staff can create doctor patient notes"
  ON public.patient_notes FOR INSERT
  WITH CHECK (public.is_staff_of(auth.uid(), doctor_id));

-- Trigger for updated_at
CREATE TRIGGER update_patient_notes_updated_at
  BEFORE UPDATE ON public.patient_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_patient_notes_patient_id ON public.patient_notes(patient_id);
CREATE INDEX idx_patient_notes_doctor_id ON public.patient_notes(doctor_id);
