
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type WarehouseLocation = Tables<'warehouse_locations'>;
type WarehouseLocationInsert = TablesInsert<'warehouse_locations'>;
type WarehouseLocationUpdate = TablesUpdate<'warehouse_locations'>;

export const useWarehouseLocations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['warehouse_locations'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('warehouse_locations')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateWarehouseLocation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (location: Omit<WarehouseLocationInsert, 'user_id' | 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('warehouse_locations')
        .insert({ ...location, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse_locations'] });
    },
  });
};

export const useUpdateWarehouseLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & WarehouseLocationUpdate) => {
      const { data, error } = await supabase
        .from('warehouse_locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse_locations'] });
    },
  });
};

export const useDeleteWarehouseLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('warehouse_locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse_locations'] });
    },
  });
};
