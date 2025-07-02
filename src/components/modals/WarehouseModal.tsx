
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateWarehouseLocation, useUpdateWarehouseLocation } from '@/hooks/useWarehouseLocations';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type WarehouseLocation = Tables<'warehouse_locations'>;

const warehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  address: z.string().optional(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse?: WarehouseLocation;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  warehouse,
}) => {
  const { toast } = useToast();
  const createWarehouse = useCreateWarehouseLocation();
  const updateWarehouse = useUpdateWarehouseLocation();

  const form = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse?.name || '',
      address: warehouse?.address || '',
    },
  });

  React.useEffect(() => {
    if (warehouse) {
      form.reset({
        name: warehouse.name,
        address: warehouse.address || '',
      });
    } else {
      form.reset({
        name: '',
        address: '',
      });
    }
  }, [warehouse, form]);

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      if (warehouse) {
        await updateWarehouse.mutateAsync({
          id: warehouse.id,
          ...data,
        });
        toast({
          title: "Success",
          description: "Warehouse location updated successfully",
        });
      } else {
        await createWarehouse.mutateAsync(data);
        toast({
          title: "Success",
          description: "Warehouse location created successfully",
        });
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error('Warehouse operation error:', error);
      toast({
        title: "Error",
        description: warehouse 
          ? "Failed to update warehouse location" 
          : "Failed to create warehouse location",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {warehouse ? 'Edit Warehouse Location' : 'Add New Warehouse Location'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Main Warehouse, Storage Facility A" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 123 Industrial St, City, State" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createWarehouse.isPending || updateWarehouse.isPending}
              >
                {createWarehouse.isPending || updateWarehouse.isPending 
                  ? 'Saving...' 
                  : warehouse ? 'Update' : 'Create'
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WarehouseModal;
