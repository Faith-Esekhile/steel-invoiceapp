-- Add inventory_item_id to invoice_items table to track which inventory item was sold
ALTER TABLE public.invoice_items 
ADD COLUMN inventory_item_id UUID REFERENCES public.inventory(id);

-- Add index for better query performance
CREATE INDEX idx_invoice_items_inventory_item_id ON public.invoice_items(inventory_item_id);

-- Update the SalesChart query to use actual inventory relationships
-- This allows tracking which products were actually sold in each invoice