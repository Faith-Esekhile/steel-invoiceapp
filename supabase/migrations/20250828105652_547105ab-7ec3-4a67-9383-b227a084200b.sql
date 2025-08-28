-- Ensure invoice items summaries are populated and kept in sync

-- Function to update the items_summary for a given invoice
CREATE OR REPLACE FUNCTION public.update_invoice_items_summary(invoice_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  summary text;
BEGIN
  SELECT string_agg(trim(BOTH ' ' FROM CONCAT(ii.quantity, ' x ', COALESCE(NULLIF(ii.description, ''), inv.name))), ', ')
  INTO summary
  FROM public.invoice_items AS ii
  LEFT JOIN public.inventory AS inv ON inv.id = ii.inventory_item_id
  WHERE ii.invoice_id = invoice_uuid;

  UPDATE public.invoices
  SET items_summary = COALESCE(summary, '')
  WHERE id = invoice_uuid;
END;
$$;

-- Trigger function to call the updater when invoice_items change
CREATE OR REPLACE FUNCTION public.trigger_update_items_summary()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.update_invoice_items_summary(OLD.invoice_id);
    RETURN OLD;
  ELSE
    PERFORM public.update_invoice_items_summary(NEW.invoice_id);
    RETURN NEW;
  END IF;
END;
$$;

-- Create (or replace) the trigger on invoice_items
DROP TRIGGER IF EXISTS trg_invoice_items_summary_insupddel ON public.invoice_items;
CREATE TRIGGER trg_invoice_items_summary_insupddel
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.trigger_update_items_summary();

-- Backfill missing or empty summaries, including those created on Aug 27
UPDATE public.invoices i
SET items_summary = COALESCE((
  SELECT string_agg(trim(BOTH ' ' FROM CONCAT(ii.quantity, ' x ', COALESCE(NULLIF(ii.description, ''), inv.name))), ', ')
  FROM public.invoice_items ii
  LEFT JOIN public.inventory inv ON inv.id = ii.inventory_item_id
  WHERE ii.invoice_id = i.id
), '')
WHERE i.items_summary IS NULL OR i.items_summary = '';