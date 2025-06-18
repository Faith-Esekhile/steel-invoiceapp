
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type CompanyInfo = Tables<'company_info'>;
type CompanyInfoInsert = TablesInsert<'company_info'>;
type CompanyInfoUpdate = TablesUpdate<'company_info'>;

export const useCompanyInfo = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['company_info', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateCompanyInfo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (updates: CompanyInfoUpdate) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('company_info')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_info'] });
    },
  });
};
