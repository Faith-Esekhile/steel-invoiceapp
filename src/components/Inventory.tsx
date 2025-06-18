
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package
} from 'lucide-react';
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';
import InventoryModal from '@/components/modals/InventoryModal';
import { Tables } from '@/integrations/supabase/types';

type InventoryItem = Tables<'inventory'>;

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>();
  
  const { data: items = [], isLoading, error } = useInventory();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
  const { toast } = useToast();

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem.mutateAsync(itemId);
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
      } catch (error) {
        console.error('Delete error:', error);
        toast({
          title: "Error",
          description: "Failed to delete item",
          variant: "destructive",
        });
      }
    }
  };

  const handleNewItem = () => {
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-700';
      case 'low_stock': return 'bg-yellow-100 text-yellow-700';
      case 'out_of_stock': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="text-lg">Loading inventory...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="text-red-600 text-lg">Error loading inventory</div>
          <p className="text-gray-600 mt-2">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your inventory items</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleNewItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Inventory Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Package className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria.' 
                  : 'Start by adding your first inventory item.'
                }
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleNewItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Item Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Unit Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Total Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                      <td className="py-3 px-4 text-gray-700">{item.description || '-'}</td>
                      <td className="py-3 px-4 text-gray-700">{item.category || '-'}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(item.status || 'in_stock')}>
                          {(item.status || 'in_stock').replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditItem(item)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-steel-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
              <Package className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-steel-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {items.filter(item => item.status === 'in_stock').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-steel-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {items.filter(item => item.status === 'low_stock').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-steel-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {items.filter(item => item.status === 'out_of_stock').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default Inventory;
