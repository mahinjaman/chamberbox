-- Create admin_staff table to manage admin panel staff
CREATE TABLE public.admin_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'support', -- support, manager, super
  is_active BOOLEAN DEFAULT true,
  invited_by UUID,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_staff ENABLE ROW LEVEL SECURITY;

-- Only admins can manage admin_staff
CREATE POLICY "Admins can view admin staff"
  ON public.admin_staff FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert admin staff"
  ON public.admin_staff FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update admin staff"
  ON public.admin_staff FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete admin staff"
  ON public.admin_staff FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_admin_staff_user_id ON public.admin_staff(user_id);
CREATE INDEX idx_admin_staff_email ON public.admin_staff(email);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_staff_updated_at
  BEFORE UPDATE ON public.admin_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();