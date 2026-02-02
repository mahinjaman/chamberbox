-- Add doctor_code to profiles (unique 4-character code for each doctor)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS doctor_code VARCHAR(6) UNIQUE;

-- Add serial_number to queue_tokens (unique booking reference)
ALTER TABLE public.queue_tokens
ADD COLUMN IF NOT EXISTS serial_number VARCHAR(20);

-- Create function to generate doctor code
CREATE OR REPLACE FUNCTION public.generate_doctor_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(6);
  code_exists BOOLEAN;
BEGIN
  -- Generate a unique 4-digit code
  LOOP
    -- Generate random 4-digit number between 1000 and 9999
    new_code := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
    
    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE doctor_code = new_code
    ) INTO code_exists;
    
    -- Exit loop if unique
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  NEW.doctor_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-generate doctor code on profile creation
DROP TRIGGER IF EXISTS generate_doctor_code_trigger ON public.profiles;
CREATE TRIGGER generate_doctor_code_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.doctor_code IS NULL)
  EXECUTE FUNCTION public.generate_doctor_code();

-- Generate doctor codes for existing profiles that don't have one
DO $$
DECLARE
  profile_record RECORD;
  new_code VARCHAR(6);
  code_exists BOOLEAN;
BEGIN
  FOR profile_record IN 
    SELECT id FROM public.profiles WHERE doctor_code IS NULL
  LOOP
    LOOP
      new_code := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
      SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE doctor_code = new_code
      ) INTO code_exists;
      IF NOT code_exists THEN
        EXIT;
      END IF;
    END LOOP;
    
    UPDATE public.profiles SET doctor_code = new_code WHERE id = profile_record.id;
  END LOOP;
END;
$$;

-- Create function to generate serial number for queue tokens
CREATE OR REPLACE FUNCTION public.generate_queue_serial_number()
RETURNS TRIGGER AS $$
DECLARE
  doc_code VARCHAR(6);
  date_part VARCHAR(6);
  seq_num INTEGER;
  new_serial VARCHAR(20);
BEGIN
  -- Get doctor code
  SELECT doctor_code INTO doc_code FROM public.profiles WHERE id = NEW.doctor_id;
  
  -- Format date as YYMMDD
  date_part := TO_CHAR(NEW.queue_date::DATE, 'YYMMDD');
  
  -- Get next sequence number for this doctor on this date
  SELECT COALESCE(MAX(
    CASE 
      WHEN serial_number IS NOT NULL AND serial_number LIKE date_part || '-' || doc_code || '-%'
      THEN NULLIF(SPLIT_PART(serial_number, '-', 3), '')::INTEGER
      ELSE 0
    END
  ), 0) + 1 INTO seq_num
  FROM public.queue_tokens
  WHERE doctor_id = NEW.doctor_id
    AND queue_date = NEW.queue_date;
  
  -- Generate serial number: YYMMDD-XXXX-0001
  new_serial := date_part || '-' || doc_code || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  NEW.serial_number := new_serial;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-generate serial number
DROP TRIGGER IF EXISTS generate_queue_serial_trigger ON public.queue_tokens;
CREATE TRIGGER generate_queue_serial_trigger
  BEFORE INSERT ON public.queue_tokens
  FOR EACH ROW
  WHEN (NEW.serial_number IS NULL)
  EXECUTE FUNCTION public.generate_queue_serial_number();

-- Create index for faster serial number lookups
CREATE INDEX IF NOT EXISTS idx_queue_tokens_serial_number ON public.queue_tokens(serial_number);