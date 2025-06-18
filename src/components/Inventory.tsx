
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

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  category: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample inventory data
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Steel Bars',
      description: 'High-grade steel bars for construction',
      quantity: 500,
      unit_price: 2500,
      category: 'Raw Materials',
      status: 'in_stock'
    },
    {
      id: '2',
      name: 'Steel Plates',
      description: 'Heavy duty steel plates',
      quantity: 15,
      unit_price: 15000,
      category: 'Raw Materials',
      status: 'low_stock'
    },
    {
      id: '3',
      name: 'Welding Rods',
      description: 'Professional welding rods',
      quantity: 0,
      unit_price: 1200,
      category: 'Tools',
      status: 'out_of_stock'
    }
  ]);

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
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your inventory items</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
                      <td className="py-3 px-4 text-gray-700">{item.description}</td>
                      <td className="py-3 px-4 text-gray-700">{item.category}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
    </div>
  );
};

export default Inventory;
