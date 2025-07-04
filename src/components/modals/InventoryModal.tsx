
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateInventoryItem, useUpdateInventoryItem } from '@/hooks/useInventory';
import { useWarehouseLocations } from '@/hooks/useWarehouseLocations';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type InventoryItem = Tables<'inventory'>;

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, item }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    category: '',
    status: 'in_stock' as 'in_stock' | 'low_stock' | 'out_of_stock',
    warehouse_location_id: ''
  });

  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const { data: warehouseLocations = [] } = useWarehouseLocations();
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        category: item.category || '',
        status: (item.status as 'in_stock' | 'low_stock' | 'out_of_stock') || 'in_stock',
        warehouse_location_id: item.warehouse_location_id || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        quantity: 0,
        unit_price: 0,
        category: '',
        status: 'in_stock',
        warehouse_location_id: ''
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate warehouse location is selected
    if (!formData.warehouse_location_id) {
      toast({
        title: "Error",
        description: "Please select a warehouse location",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (item) {
        await updateItem.mutateAsync({ id: item.id, ...formData });
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        await createItem.mutateAsync(formData);
        toast({
          title: "Success",
          description: "Item created successfully",
        });
      }
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save item",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="warehouse_location">Warehouse Location *</Label>
            <Select 
              value={formData.warehouse_location_id} 
              onValueChange={(value) => setFormData({ ...formData, warehouse_location_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse location *" />
              </SelectTrigger>
              <SelectContent>
                {warehouseLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="unit_price">Unit Price (₦) *</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'in_stock' | 'low_stock' | 'out_of_stock') => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
              {createItem.isPending || updateItem.isPending ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;
