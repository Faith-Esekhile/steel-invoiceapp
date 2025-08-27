-- Add items_summary column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN items_summary text;