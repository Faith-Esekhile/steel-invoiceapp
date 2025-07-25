
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type CompanyExpense = Tables<'company_expenses'>;
type CompanyExpenseInsert = TablesInsert<'company_expenses'>;
type CompanyExpenseUpdate = TablesUpdate<'company_expenses'>;

export const useCompanyExpenses = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['company_expenses'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('company_expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (expense: Omit<CompanyExpenseInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('company_expenses')
        .insert({ ...expense, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_expenses'] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & CompanyExpenseUpdate) => {
      const { data, error } = await supabase
        .from('company_expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_expenses'] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_expenses'] });
    },
  });
};
