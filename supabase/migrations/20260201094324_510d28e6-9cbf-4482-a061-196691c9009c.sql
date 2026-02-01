-- Create investigations table with common medical investigations
CREATE TABLE public.investigations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view investigations (public reference data)
CREATE POLICY "Anyone can view investigations" 
ON public.investigations 
FOR SELECT 
USING (true);

-- Add investigations column to prescriptions table
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS investigations JSONB DEFAULT '[]'::jsonb;

-- Insert common investigations
INSERT INTO public.investigations (name, name_bn, category) VALUES
-- Blood Tests
('Complete Blood Count (CBC)', 'সম্পূর্ণ রক্ত গণনা', 'Blood'),
('Hemoglobin (Hb)', 'হিমোগ্লোবিন', 'Blood'),
('ESR', 'ইএসআর', 'Blood'),
('Blood Glucose Fasting', 'রক্তে শর্করা (খালি পেটে)', 'Blood'),
('Blood Glucose PP', 'রক্তে শর্করা (খাওয়ার পরে)', 'Blood'),
('HbA1c', 'এইচবিএওয়ানসি', 'Blood'),
('Lipid Profile', 'লিপিড প্রোফাইল', 'Blood'),
('Liver Function Test (LFT)', 'লিভার ফাংশন টেস্ট', 'Blood'),
('Kidney Function Test (KFT)', 'কিডনি ফাংশন টেস্ট', 'Blood'),
('Serum Creatinine', 'সিরাম ক্রিয়েটিনিন', 'Blood'),
('Blood Urea', 'ব্লাড ইউরিয়া', 'Blood'),
('Uric Acid', 'ইউরিক এসিড', 'Blood'),
('Thyroid Profile (T3, T4, TSH)', 'থাইরয়েড প্রোফাইল', 'Blood'),
('TSH', 'টিএসএইচ', 'Blood'),
('Serum Electrolytes', 'সিরাম ইলেকট্রোলাইটস', 'Blood'),
('Serum Calcium', 'সিরাম ক্যালসিয়াম', 'Blood'),
('Vitamin D', 'ভিটামিন ডি', 'Blood'),
('Vitamin B12', 'ভিটামিন বি১২', 'Blood'),
('Serum Iron', 'সিরাম আয়রন', 'Blood'),
('TIBC', 'টিআইবিসি', 'Blood'),
('Serum Ferritin', 'সিরাম ফেরিটিন', 'Blood'),
('Prothrombin Time (PT)', 'প্রোথ্রম্বিন টাইম', 'Blood'),
('APTT', 'এপিটিটি', 'Blood'),
('Blood Group & Rh', 'ব্লাড গ্রুপ', 'Blood'),
('CRP', 'সিআরপি', 'Blood'),
('RA Factor', 'আরএ ফ্যাক্টর', 'Blood'),
('ANA', 'এএনএ', 'Blood'),
('ASO Titre', 'এএসও টাইটার', 'Blood'),
('HBsAg', 'এইচবিএসএজি', 'Blood'),
('Anti HCV', 'অ্যান্টি এইচসিভি', 'Blood'),
('HIV', 'এইচআইভি', 'Blood'),
('VDRL', 'ভিডিআরএল', 'Blood'),
('Widal Test', 'ওয়াইডাল টেস্ট', 'Blood'),
('Dengue NS1', 'ডেঙ্গু এনএস১', 'Blood'),
('Dengue IgG/IgM', 'ডেঙ্গু আইজিজি/আইজিএম', 'Blood'),
('Malaria (MP)', 'ম্যালেরিয়া', 'Blood'),
('Troponin I', 'ট্রোপোনিন আই', 'Blood'),
('D-Dimer', 'ডি-ডাইমার', 'Blood'),
('NT-proBNP', 'এনটি-প্রোবিএনপি', 'Blood'),
('PSA', 'পিএসএ', 'Blood'),
('CA-125', 'সিএ-১২৫', 'Blood'),
('AFP', 'এএফপি', 'Blood'),

-- Urine Tests
('Routine Urine Examination (R/E)', 'রুটিন ইউরিন পরীক্ষা', 'Urine'),
('Urine Culture & Sensitivity', 'ইউরিন কালচার', 'Urine'),
('24hr Urine Protein', '২৪ ঘন্টা ইউরিন প্রোটিন', 'Urine'),
('Urine Microalbumin', 'ইউরিন মাইক্রোঅ্যালবুমিন', 'Urine'),

-- Stool Tests
('Stool R/E', 'মল পরীক্ষা', 'Stool'),
('Stool Culture', 'স্টুল কালচার', 'Stool'),
('Stool for Occult Blood', 'স্টুল অকাল্ট ব্লাড', 'Stool'),

-- Imaging
('Chest X-Ray PA View', 'বুকের এক্স-রে', 'Imaging'),
('X-Ray Spine', 'স্পাইন এক্স-রে', 'Imaging'),
('X-Ray Abdomen', 'পেটের এক্স-রে', 'Imaging'),
('USG Whole Abdomen', 'আল্ট্রাসনোগ্রাফি (পেট)', 'Imaging'),
('USG Lower Abdomen', 'আল্ট্রাসনোগ্রাফি (তলপেট)', 'Imaging'),
('USG Thyroid', 'থাইরয়েড আল্ট্রাসনোগ্রাফি', 'Imaging'),
('Echocardiogram', 'ইকোকার্ডিওগ্রাম', 'Imaging'),
('CT Scan Brain', 'সিটি স্ক্যান (মস্তিষ্ক)', 'Imaging'),
('CT Scan Chest', 'সিটি স্ক্যান (বুক)', 'Imaging'),
('CT Scan Abdomen', 'সিটি স্ক্যান (পেট)', 'Imaging'),
('MRI Brain', 'এমআরআই (মস্তিষ্ক)', 'Imaging'),
('MRI Spine', 'এমআরআই (স্পাইন)', 'Imaging'),
('Mammography', 'ম্যামোগ্রাফি', 'Imaging'),

-- Cardiac
('ECG', 'ইসিজি', 'Cardiac'),
('ETT (Treadmill Test)', 'ইটিটি', 'Cardiac'),
('Holter Monitor', 'হোল্টার মনিটর', 'Cardiac'),
('Coronary Angiogram', 'করোনারি এনজিওগ্রাম', 'Cardiac'),

-- Others
('Endoscopy (Upper GI)', 'এন্ডোস্কোপি', 'GI'),
('Colonoscopy', 'কোলোনোস্কোপি', 'GI'),
('Spirometry (PFT)', 'স্পাইরোমেট্রি', 'Pulmonary'),
('EEG', 'ইইজি', 'Neurology'),
('EMG/NCV', 'ইএমজি/এনসিভি', 'Neurology'),
('Bone Densitometry (DEXA)', 'বোন ডেনসিটোমেট্রি', 'Bone'),
('Biopsy', 'বায়োপসি', 'Pathology'),
('FNAC', 'এফএনএসি', 'Pathology'),
('Sputum for AFB', 'কফ পরীক্ষা (এএফবি)', 'Microbiology'),
('Sputum Culture', 'কফ কালচার', 'Microbiology'),
('Throat Swab', 'থ্রোট সোয়াব', 'Microbiology');