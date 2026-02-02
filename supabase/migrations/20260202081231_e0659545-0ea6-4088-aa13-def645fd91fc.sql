-- Add billing period discount columns to subscription_plans
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS discount_quarterly INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS discount_biannual INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS discount_yearly INTEGER DEFAULT 17;

-- Add price columns for 3-month and 6-month periods (optional, for custom pricing)
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS price_quarterly NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS price_biannual NUMERIC DEFAULT NULL;