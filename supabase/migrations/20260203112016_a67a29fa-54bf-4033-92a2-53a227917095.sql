-- Create staff_custom_permissions table for custom permission overrides
CREATE TABLE public.staff_custom_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  use_custom BOOLEAN DEFAULT false,
  can_manage_queue BOOLEAN DEFAULT NULL,
  can_view_patient_list BOOLEAN DEFAULT NULL,
  can_add_patients BOOLEAN DEFAULT NULL,
  can_edit_patients BOOLEAN DEFAULT NULL,
  can_view_prescriptions BOOLEAN DEFAULT NULL,
  can_view_finances BOOLEAN DEFAULT NULL,
  can_manage_staff BOOLEAN DEFAULT NULL,
  can_manage_integrations BOOLEAN DEFAULT NULL,
  can_view_settings BOOLEAN DEFAULT NULL,
  can_manage_chambers BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(staff_id)
);

-- Enable Row Level Security
ALTER TABLE public.staff_custom_permissions ENABLE ROW LEVEL SECURITY;

-- Doctors can manage permissions for their own staff
CREATE POLICY "Doctors can view their staff permissions"
  ON public.staff_custom_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      JOIN public.profiles p ON sm.doctor_id = p.id
      WHERE sm.id = staff_custom_permissions.staff_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can insert staff permissions"
  ON public.staff_custom_permissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      JOIN public.profiles p ON sm.doctor_id = p.id
      WHERE sm.id = staff_custom_permissions.staff_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their staff permissions"
  ON public.staff_custom_permissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      JOIN public.profiles p ON sm.doctor_id = p.id
      WHERE sm.id = staff_custom_permissions.staff_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete their staff permissions"
  ON public.staff_custom_permissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      JOIN public.profiles p ON sm.doctor_id = p.id
      WHERE sm.id = staff_custom_permissions.staff_id
        AND p.user_id = auth.uid()
    )
  );

-- Staff can view their own permissions
CREATE POLICY "Staff can view own permissions"
  ON public.staff_custom_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.id = staff_custom_permissions.staff_id
        AND sm.user_id = auth.uid()
    )
  );

-- Trigger to auto-update updated_at
CREATE TRIGGER update_staff_custom_permissions_updated_at
  BEFORE UPDATE ON public.staff_custom_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();