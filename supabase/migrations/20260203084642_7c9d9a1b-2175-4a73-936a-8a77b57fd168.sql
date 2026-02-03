-- Fix: Add trigger to decrement patient count when patients are deleted
CREATE OR REPLACE FUNCTION public.decrement_patient_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.subscription_usage 
  SET 
    total_patients = GREATEST(0, total_patients - 1),
    updated_at = now()
  WHERE doctor_id = OLD.doctor_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for patient deletion
DROP TRIGGER IF EXISTS on_patient_deleted ON public.patients;
CREATE TRIGGER on_patient_deleted
  AFTER DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.decrement_patient_count();

-- Sync all doctors' patient counts to actual values
UPDATE public.subscription_usage su
SET 
  total_patients = COALESCE((
    SELECT COUNT(*) FROM public.patients p WHERE p.doctor_id = su.doctor_id
  ), 0),
  updated_at = now();