-- Update existing invoices to populate items_summary from invoice_items
UPDATE invoices 
SET items_summary = (
  SELECT string_agg(
    CONCAT(invoice_items.quantity, 'x ', invoice_items.description), 
    ', '
  )
  FROM invoice_items 
  WHERE invoice_items.invoice_id = invoices.id
)
WHERE items_summary IS NULL;