-- Add max_patients_per_session to chambers table
ALTER TABLE public.chambers ADD COLUMN max_patients_per_session INTEGER DEFAULT 30;