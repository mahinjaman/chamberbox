-- Add prescription and payment tracking columns to queue_tokens
ALTER TABLE public.queue_tokens 
ADD COLUMN IF NOT EXISTS prescription_id uuid REFERENCES public.prescriptions(id),
ADD COLUMN IF NOT EXISTS payment_collected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method text;

-- Add comment for clarity
COMMENT ON COLUMN public.queue_tokens.prescription_id IS 'Reference to the prescription created for this queue visit';
COMMENT ON COLUMN public.queue_tokens.payment_collected IS 'Whether payment has been collected for this visit';
COMMENT ON COLUMN public.queue_tokens.payment_amount IS 'Amount collected for this visit';
COMMENT ON COLUMN public.queue_tokens.payment_method IS 'Payment method used (cash, bkash, nagad, etc.)';