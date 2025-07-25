
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
    queryKey: ['company_info'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .maybeSingle();
      
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
      
      // First check if company info exists
      const { data: existing, error: checkError } = await supabase
        .from('company_info')
        .select('id')
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('company_info')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('company_info')
          .insert({ ...updates, user_id: user.id })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_info'] });
    },
  });
};
