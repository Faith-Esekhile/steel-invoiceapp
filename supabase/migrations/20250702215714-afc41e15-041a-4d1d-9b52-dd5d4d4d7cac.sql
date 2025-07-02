
-- Create warehouse_locations table
CREATE TABLE public.warehouse_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on warehouse_locations table
ALTER TABLE public.warehouse_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for warehouse_locations
CREATE POLICY "Users can view their own warehouse locations" ON public.warehouse_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own warehouse locations" ON public.warehouse_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own warehouse locations" ON public.warehouse_locations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own warehouse locations" ON public.warehouse_locations
  FOR DELETE USING (auth.uid() = user_id);

-- Add warehouse_location_id column to inventory table
ALTER TABLE public.inventory ADD COLUMN warehouse_location_id UUID REFERENCES public.warehouse_locations(id);

-- Update inventory status to automatically show low_stock when quantity < 25
-- Create a function to automatically update inventory status based on quantity
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= 0 THEN
    NEW.status = 'out_of_stock';
  ELSIF NEW.quantity < 25 THEN
    NEW.status = 'low_stock';
  ELSE
    NEW.status = 'in_stock';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update inventory status
CREATE TRIGGER trigger_update_inventory_status
  BEFORE INSERT OR UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_status();

-- Insert default warehouse locations for existing users
INSERT INTO public.warehouse_locations (user_id, name, address)
SELECT DISTINCT user_id, 'Main Warehouse', 'Main warehouse location'
FROM public.inventory
WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.warehouse_locations (user_id, name, address)
SELECT DISTINCT user_id, 'Secondary Warehouse', 'Secondary warehouse location'
FROM public.inventory
WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.warehouse_locations (user_id, name, address)
SELECT DISTINCT user_id, 'Storage Facility', 'Storage facility location'
FROM public.inventory
WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;
