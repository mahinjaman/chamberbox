-- Create medicines table for smart medicine database
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  brand_name_bn TEXT,
  dosage_form TEXT,
  strength TEXT,
  manufacturer TEXT,
  default_dosage TEXT DEFAULT '1+0+1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Medicines are read-only for all authenticated users
CREATE POLICY "Anyone can view medicines"
ON public.medicines
FOR SELECT
USING (true);

-- Grant access to authenticated users only
REVOKE ALL ON public.medicines FROM anon;
GRANT SELECT ON public.medicines TO authenticated;

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  advice TEXT,
  next_visit_date DATE,
  language TEXT DEFAULT 'english',
  template_name TEXT,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for prescriptions
CREATE POLICY "Doctors can view own prescriptions"
ON public.prescriptions
FOR SELECT
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert prescriptions"
ON public.prescriptions
FOR INSERT
WITH CHECK (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own prescriptions"
ON public.prescriptions
FOR UPDATE
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own prescriptions"
ON public.prescriptions
FOR DELETE
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Revoke anon access
REVOKE ALL ON public.prescriptions FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescriptions TO authenticated;

-- Create prescription templates table
CREATE TABLE public.prescription_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  name TEXT NOT NULL,
  medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  advice TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Doctors can view own templates"
ON public.prescription_templates
FOR SELECT
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert templates"
ON public.prescription_templates
FOR INSERT
WITH CHECK (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own templates"
ON public.prescription_templates
FOR UPDATE
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own templates"
ON public.prescription_templates
FOR DELETE
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

REVOKE ALL ON public.prescription_templates FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescription_templates TO authenticated;

-- Create transactions table for financial tracking
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bkash', 'nagad', 'card', 'due', 'other')),
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Doctors can view own transactions"
ON public.transactions
FOR SELECT
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert transactions"
ON public.transactions
FOR INSERT
WITH CHECK (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own transactions"
ON public.transactions
FOR UPDATE
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own transactions"
ON public.transactions
FOR DELETE
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

REVOKE ALL ON public.transactions FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;

-- Create SMS settings table
CREATE TABLE public.sms_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL UNIQUE,
  gateway TEXT DEFAULT 'manual',
  api_key TEXT,
  sender_id TEXT,
  token_notification BOOLEAN DEFAULT true,
  followup_reminder BOOLEAN DEFAULT true,
  due_reminder BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sms_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own sms settings"
ON public.sms_settings
FOR SELECT
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert sms settings"
ON public.sms_settings
FOR INSERT
WITH CHECK (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own sms settings"
ON public.sms_settings
FOR UPDATE
USING (doctor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

REVOKE ALL ON public.sms_settings FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.sms_settings TO authenticated;

-- Add realtime for queue_tokens
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_tokens;

-- Seed common medicines database
INSERT INTO public.medicines (brand_name, generic_name, brand_name_bn, dosage_form, strength, manufacturer, default_dosage) VALUES
('Napa', 'Paracetamol', 'নাপা', 'Tablet', '500mg', 'Beximco', '1+0+1'),
('Napa Extra', 'Paracetamol + Caffeine', 'নাপা এক্সট্রা', 'Tablet', '500mg+65mg', 'Beximco', '1+0+1'),
('Ace', 'Paracetamol', 'এস', 'Tablet', '500mg', 'Square', '1+0+1'),
('Ace Plus', 'Paracetamol + Caffeine', 'এস প্লাস', 'Tablet', '500mg+65mg', 'Square', '1+0+1'),
('Seclo', 'Omeprazole', 'সেক্লো', 'Capsule', '20mg', 'Square', '1+0+0'),
('Sergel', 'Esomeprazole', 'সার্জেল', 'Capsule', '20mg', 'Healthcare', '1+0+0'),
('Zimax', 'Azithromycin', 'জিম্যাক্স', 'Tablet', '500mg', 'Square', '1+0+0'),
('Azicin', 'Azithromycin', 'এজিসিন', 'Tablet', '500mg', 'Beximco', '1+0+0'),
('Ciprocin', 'Ciprofloxacin', 'সিপ্রোসিন', 'Tablet', '500mg', 'Square', '1+0+1'),
('Cef-3', 'Cefixime', 'সেফ-৩', 'Capsule', '200mg', 'Square', '1+0+1'),
('Losectil', 'Omeprazole', 'লসেক্টিল', 'Capsule', '20mg', 'Eskayef', '1+0+0'),
('Amodis', 'Metronidazole', 'এমোডিস', 'Tablet', '400mg', 'Square', '1+1+1'),
('Filwel Silver', 'Multivitamin', 'ফিলওয়েল সিলভার', 'Tablet', '', 'Square', '0+0+1'),
('Cal D', 'Calcium + Vitamin D', 'ক্যাল ডি', 'Tablet', '500mg', 'Incepta', '0+0+1'),
('Fexo', 'Fexofenadine', 'ফেক্সো', 'Tablet', '120mg', 'Square', '0+0+1'),
('Brodil', 'Salbutamol', 'ব্রডিল', 'Syrup', '2mg/5ml', 'Square', '1+1+1'),
('Montas', 'Montelukast', 'মন্টাস', 'Tablet', '10mg', 'Square', '0+0+1'),
('Tory', 'Ketorolac', 'টরি', 'Tablet', '10mg', 'Beximco', '1+0+1'),
('Neotack', 'Ranitidine', 'নিওট্যাক', 'Tablet', '150mg', 'Square', '1+0+1'),
('Monas', 'Dexamethasone', 'মনাস', 'Tablet', '0.5mg', 'Square', '1+1+1');

-- Create trigger to update prescriptions updated_at
CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for sms_settings updated_at
CREATE TRIGGER update_sms_settings_updated_at
BEFORE UPDATE ON public.sms_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();