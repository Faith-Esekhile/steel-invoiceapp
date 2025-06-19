
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type InvoiceItem = Tables<'invoice_items'>;
type InvoiceItemInsert = TablesInsert<'invoice_items'>;

export const useInvoiceItems = (invoiceId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['invoice_items', invoiceId],
    queryFn: async () => {
      if (!user || !invoiceId) return [];
      
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!invoiceId,
  });
};

export const useCreateInvoiceItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (items: InvoiceItemInsert[]) => {
      const { data, error } = await supabase
        .from('invoice_items')
        .insert(items)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice_items'] });
    },
  });
};

export const useUpdateInventoryQuantity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ inventoryId, quantityToReduce }: { inventoryId: string; quantityToReduce: number }) => {
      // First get current quantity
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', inventoryId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newQuantity = Math.max(0, currentItem.quantity - quantityToReduce);
      
      const { data, error } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', inventoryId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
