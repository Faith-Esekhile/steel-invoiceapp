
-- Add bank details columns to the company_info table
ALTER TABLE public.company_info 
ADD COLUMN bank_name TEXT,
ADD COLUMN account_name TEXT,
ADD COLUMN account_number TEXT,
ADD COLUMN sort_code TEXT;
