-- Create subscription_payments table for storing payment submissions
CREATE TABLE public.subscription_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_tier TEXT NOT NULL,
  billing_period TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  payer_mobile TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Doctors can view their own payments
CREATE POLICY "Doctors can view own payments"
ON public.subscription_payments
FOR SELECT
USING (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Doctors can insert their own payments
CREATE POLICY "Doctors can submit payments"
ON public.subscription_payments
FOR INSERT
WITH CHECK (doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.subscription_payments
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can update payments (for verification)
CREATE POLICY "Admins can update payments"
ON public.subscription_payments
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_subscription_payments_updated_at
BEFORE UPDATE ON public.subscription_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();