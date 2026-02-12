CREATE OR REPLACE FUNCTION public.generate_queue_serial_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc_code VARCHAR(20);
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
$$;