-- Update RLS policies to allow all authenticated users to access all data
-- This changes from user-specific data to shared data across all users

-- Drop existing user-specific policies for invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

-- Create new shared policies for invoices
CREATE POLICY "Authenticated users can view all invoices" 
ON public.invoices 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all invoices" 
ON public.invoices 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all invoices" 
ON public.invoices 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Drop existing user-specific policies for invoice_items
DROP POLICY IF EXISTS "Users can view own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can view invoice items for their invoices" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can create own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can create invoice items for their invoices" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items for their invoices" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items for their invoices" ON public.invoice_items;

-- Create new shared policies for invoice_items
CREATE POLICY "Authenticated users can view all invoice items" 
ON public.invoice_items 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create invoice items" 
ON public.invoice_items 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all invoice items" 
ON public.invoice_items 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all invoice items" 
ON public.invoice_items 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Drop existing user-specific policies for clients
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

-- Create new shared policies for clients
CREATE POLICY "Authenticated users can view all clients" 
ON public.clients 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all clients" 
ON public.clients 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all clients" 
ON public.clients 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Drop existing user-specific policies for company_expenses
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.company_expenses;
DROP POLICY IF EXISTS "Users can create their own expenses" ON public.company_expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.company_expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.company_expenses;

-- Create new shared policies for company_expenses
CREATE POLICY "Authenticated users can view all expenses" 
ON public.company_expenses 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create expenses" 
ON public.company_expenses 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all expenses" 
ON public.company_expenses 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all expenses" 
ON public.company_expenses 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Drop existing user-specific policies for warehouse_locations
DROP POLICY IF EXISTS "Users can view their own warehouse locations" ON public.warehouse_locations;
DROP POLICY IF EXISTS "Users can create their own warehouse locations" ON public.warehouse_locations;
DROP POLICY IF EXISTS "Users can update their own warehouse locations" ON public.warehouse_locations;
DROP POLICY IF EXISTS "Users can delete their own warehouse locations" ON public.warehouse_locations;

-- Create new shared policies for warehouse_locations
CREATE POLICY "Authenticated users can view all warehouse locations" 
ON public.warehouse_locations 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create warehouse locations" 
ON public.warehouse_locations 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all warehouse locations" 
ON public.warehouse_locations 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all warehouse locations" 
ON public.warehouse_locations 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Drop existing user-specific policies for inventory
DROP POLICY IF EXISTS "Users can view their own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can create their own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can update their own inventory" ON public.inventory;
DROP POLICY IF EXISTS "Users can delete their own inventory" ON public.inventory;

-- Create new shared policies for inventory
CREATE POLICY "Authenticated users can view all inventory" 
ON public.inventory 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create inventory" 
ON public.inventory 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all inventory" 
ON public.inventory 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all inventory" 
ON public.inventory 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Drop existing user-specific policies for company_info
DROP POLICY IF EXISTS "Users can view their own company info" ON public.company_info;
DROP POLICY IF EXISTS "Users can create their own company info" ON public.company_info;
DROP POLICY IF EXISTS "Users can update their own company info" ON public.company_info;
DROP POLICY IF EXISTS "Users can delete their own company info" ON public.company_info;

-- Create new shared policies for company_info
CREATE POLICY "Authenticated users can view all company info" 
ON public.company_info 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create company info" 
ON public.company_info 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update all company info" 
ON public.company_info 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete all company info" 
ON public.company_info 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Keep profiles user-specific for security (users should only see their own profile)
-- Profiles policies remain unchanged