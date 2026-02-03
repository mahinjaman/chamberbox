
-- Create trigger for incrementing prescription count on INSERT
DROP TRIGGER IF EXISTS on_prescription_created ON public.prescriptions;
CREATE TRIGGER on_prescription_created
  AFTER INSERT ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_prescription_usage();

-- Create trigger for decrementing prescription count on DELETE
DROP TRIGGER IF EXISTS on_prescription_deleted ON public.prescriptions;
CREATE TRIGGER on_prescription_deleted
  AFTER DELETE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_prescription_count();

-- Create trigger for incrementing patient count on INSERT
DROP TRIGGER IF EXISTS on_patient_created ON public.patients;
CREATE TRIGGER on_patient_created
  AFTER INSERT ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_patient_usage();

-- Create trigger for decrementing patient count on DELETE
DROP TRIGGER IF EXISTS on_patient_deleted ON public.patients;
CREATE TRIGGER on_patient_deleted
  AFTER DELETE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_patient_count();

-- Sync the subscription_usage with actual counts
UPDATE public.subscription_usage su
SET 
  total_prescriptions = (SELECT COUNT(*) FROM prescriptions p WHERE p.doctor_id = su.doctor_id),
  prescriptions_this_month = (SELECT COUNT(*) FROM prescriptions p WHERE p.doctor_id = su.doctor_id AND date_trunc('month', p.created_at) = date_trunc('month', now())),
  total_patients = (SELECT COUNT(*) FROM patients pt WHERE pt.doctor_id = su.doctor_id),
  updated_at = now();
