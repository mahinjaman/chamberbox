-- 1. Fix prescription delete - handle CASCADE on queue_tokens reference
-- When prescription is deleted, set prescription_id to NULL in queue_tokens
ALTER TABLE public.queue_tokens 
  DROP CONSTRAINT IF EXISTS queue_tokens_prescription_id_fkey;

ALTER TABLE public.queue_tokens 
  ADD CONSTRAINT queue_tokens_prescription_id_fkey 
  FOREIGN KEY (prescription_id) 
  REFERENCES public.prescriptions(id) 
  ON DELETE SET NULL;

-- 2. Create trigger for prescription count decrement (like patient count)
CREATE OR REPLACE FUNCTION public.decrement_prescription_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.subscription_usage 
  SET 
    total_prescriptions = GREATEST(0, total_prescriptions - 1),
    -- Also decrement monthly if deleted in current month
    prescriptions_this_month = CASE 
      WHEN OLD.created_at >= date_trunc('month', CURRENT_DATE)
      THEN GREATEST(0, prescriptions_this_month - 1)
      ELSE prescriptions_this_month
    END,
    updated_at = now()
  WHERE doctor_id = OLD.doctor_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for prescription delete
DROP TRIGGER IF EXISTS on_prescription_deleted ON public.prescriptions;
CREATE TRIGGER on_prescription_deleted
  AFTER DELETE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_prescription_count();

-- 3. Sync current prescription counts with actual data
UPDATE public.subscription_usage su
SET 
  total_prescriptions = (
    SELECT COUNT(*) FROM public.prescriptions p 
    WHERE p.doctor_id = su.doctor_id
  ),
  prescriptions_this_month = (
    SELECT COUNT(*) FROM public.prescriptions p 
    WHERE p.doctor_id = su.doctor_id 
    AND p.created_at >= date_trunc('month', CURRENT_DATE)
  ),
  updated_at = now();