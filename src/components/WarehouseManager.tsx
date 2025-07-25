
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
  Warehouse
} from 'lucide-react';
import { useWarehouseLocations, useDeleteWarehouseLocation } from '@/hooks/useWarehouseLocations';
import { useToast } from '@/hooks/use-toast';
import WarehouseModal from '@/components/modals/WarehouseModal';
import { Tables } from '@/integrations/supabase/types';

type WarehouseLocation = Tables<'warehouse_locations'>;

const WarehouseManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseLocation | undefined>();
  
  const { data: warehouses = [], isLoading, error } = useWarehouseLocations();
  const deleteWarehouse = useDeleteWarehouseLocation();
  const { toast } = useToast();

  const handleDelete = async (warehouseId: string) => {
    if (confirm('Are you sure you want to delete this warehouse location? This action cannot be undone.')) {
      try {
        await deleteWarehouse.mutateAsync(warehouseId);
        toast({
          title: "Success",
          description: "Warehouse location deleted successfully",
        });
      } catch (error) {
        console.error('Delete error:', error);
        toast({
          title: "Error",
          description: "Failed to delete warehouse location",
          variant: "destructive",
        });
      }
    }
  };

  const handleNewWarehouse = () => {
    setSelectedWarehouse(undefined);
    setIsModalOpen(true);
  };

  const handleEditWarehouse = (warehouse: WarehouseLocation) => {
    setSelectedWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (warehouse.address && warehouse.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="text-lg">Loading warehouse locations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="text-red-600 text-lg">Error loading warehouse locations</div>
          <p className="text-gray-600 mt-2">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="text-gray-600 mt-1">Manage your warehouse locations and addresses</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleNewWarehouse}>
          <Plus className="w-4 h-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search warehouse locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Warehouse List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Warehouse Locations ({filteredWarehouses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredWarehouses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Warehouse className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No warehouse locations found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria.' 
                  : 'Start by adding your first warehouse location.'
                }
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleNewWarehouse}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Warehouse
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWarehouses.map((warehouse) => (
                <Card key={warehouse.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <Warehouse className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
                          <p className="text-sm text-gray-600">{warehouse.address || 'No address provided'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        Created {new Date(warehouse.created_at).toLocaleDateString()}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditWarehouse(warehouse)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(warehouse.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        warehouse={selectedWarehouse}
      />
    </div>
  );
};

export default WarehouseManager;
