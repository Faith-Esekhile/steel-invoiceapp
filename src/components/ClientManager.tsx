
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
  Eye, 
  Phone,
  Mail,
  Building,
  FileText
} from 'lucide-react';

const ClientManager = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock client data
  const clients = [
    {
      id: '1',
      companyName: 'Acme Corporation',
      contactName: 'John Smith',
      email: 'john.smith@acme.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business Ave, Suite 100, New York, NY 10001',
      totalInvoices: 12,
      totalAmount: 45600.00,
      lastInvoice: '2024-06-15'
    },
    {
      id: '2',
      companyName: 'Tech Solutions Inc',
      contactName: 'Sarah Johnson',
      email: 'sarah@techsolutions.com',
      phone: '+1 (555) 987-6543',
      address: '456 Innovation Drive, San Francisco, CA 94105',
      totalInvoices: 8,
      totalAmount: 32400.50,
      lastInvoice: '2024-06-14'
    },
    {
      id: '3',
      companyName: 'Steel Works Ltd',
      contactName: 'Mike Wilson',
      email: 'mike.wilson@steelworks.com',
      phone: '+1 (555) 456-7890',
      address: '789 Industrial Blvd, Chicago, IL 60601',
      totalInvoices: 15,
      totalAmount: 67800.75,
      lastInvoice: '2024-06-10'
    },
    {
      id: '4',
      companyName: 'Construction Co',
      contactName: 'Lisa Brown',
      email: 'lisa@constructionco.com',
      phone: '+1 (555) 321-0987',
      address: '321 Builder St, Houston, TX 77001',
      totalInvoices: 20,
      totalAmount: 89500.00,
      lastInvoice: '2024-06-12'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredClients = clients.filter(client => 
    client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-steel-600 mt-1">Manage your client relationships and contact information</p>
        </div>
        <Button className="steel-button">
          <Plus className="w-4 h-4 mr-2" />
          New Client
        </Button>
      </div>

      {/* Search */}
      <Card className="steel-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-400 h-4 w-4" />
            <Input
              placeholder="Search clients by company, contact name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="steel-card hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {client.companyName}
                    </CardTitle>
                    <p className="text-sm text-steel-600">{client.contactName}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-steel-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center text-sm text-steel-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{client.phone}</span>
                </div>
              </div>

              {/* Address */}
              <div className="text-sm text-steel-600">
                <p className="line-clamp-2">{client.address}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-steel-200">
                <div>
                  <p className="text-xs text-steel-500">Total Invoices</p>
                  <p className="font-semibold text-gray-900">{client.totalInvoices}</p>
                </div>
                <div>
                  <p className="text-xs text-steel-500">Total Amount</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(client.totalAmount)}</p>
                </div>
              </div>

              {/* Last Invoice */}
              <div className="pt-2">
                <p className="text-xs text-steel-500">Last Invoice</p>
                <p className="text-sm text-gray-900">{formatDate(client.lastInvoice)}</p>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  View Invoices
                </Button>
                <Button className="steel-button flex-1" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <Card className="steel-card">
          <CardContent className="text-center py-12">
            <div className="text-steel-400 mb-4">
              <Building className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-steel-600 mb-6">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding your first client.'}
            </p>
            <Button className="steel-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Client
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientManager;
