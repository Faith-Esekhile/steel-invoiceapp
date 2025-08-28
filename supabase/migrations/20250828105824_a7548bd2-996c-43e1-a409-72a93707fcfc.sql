-- Fix security warnings by properly dropping trigger first then functions

-- Drop the trigger first
DROP TRIGGER IF EXISTS trg_invoice_items_summary_insupddel ON public.invoice_items;

-- Now drop the functions
DROP FUNCTION IF EXISTS public.trigger_update_items_summary();
DROP FUNCTION IF EXISTS public.update_invoice_items_summary(uuid);

-- Function to update the items_summary for a given invoice
CREATE OR REPLACE FUNCTION public.update_invoice_items_summary(invoice_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
SECURITY DEFINER
SET search_path = public
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

-- Recreate the trigger on invoice_items
CREATE TRIGGER trg_invoice_items_summary_insupddel
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.trigger_update_items_summary();