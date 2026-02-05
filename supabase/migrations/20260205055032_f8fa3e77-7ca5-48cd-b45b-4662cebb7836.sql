-- Allow admins to insert subscription payments (for manual payment entry)
CREATE POLICY "Admins can insert payments"
ON public.subscription_payments
FOR INSERT
WITH CHECK (is_admin(auth.uid()));