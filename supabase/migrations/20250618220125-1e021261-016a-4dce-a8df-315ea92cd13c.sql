
-- Create inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company_info table
CREATE TABLE public.company_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT NOT NULL DEFAULT 'Marvellous Steel',
  tagline TEXT DEFAULT 'Enterprise Solutions',
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inventory table
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory
CREATE POLICY "Users can view their own inventory" ON public.inventory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory" ON public.inventory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" ON public.inventory
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory" ON public.inventory
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on company_info table
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_info
CREATE POLICY "Users can view their own company info" ON public.company_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company info" ON public.company_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company info" ON public.company_info
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company info" ON public.company_info
  FOR DELETE USING (auth.uid() = user_id);

-- Insert default company info for existing users (optional)
INSERT INTO public.company_info (user_id, company_name, tagline)
SELECT id, 'Marvellous Steel', 'Enterprise Solutions'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.company_info);
