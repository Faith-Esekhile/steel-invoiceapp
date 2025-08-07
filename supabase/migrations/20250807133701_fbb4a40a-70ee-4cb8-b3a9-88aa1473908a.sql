-- Add is_backdated field to invoices table
ALTER TABLE public.invoices 
ADD COLUMN is_backdated boolean NOT NULL DEFAULT false;

-- Update all invoices created from July 11, 2024 onwards to be backdated
UPDATE public.invoices 
SET is_backdated = true 
WHERE created_at >= '2024-07-11'::date;