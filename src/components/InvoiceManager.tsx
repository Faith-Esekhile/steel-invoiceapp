
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  MoreHorizontal
} from 'lucide-react';

const InvoiceManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock invoice data
  const invoices = [
    {
      id: 'INV-001',
      client: 'Acme Corporation',
      amount: 2500.00,
      issueDate: '2024-06-15',
      dueDate: '2024-07-15',
      status: 'paid'
    },
    {
      id: 'INV-002',
      client: 'Tech Solutions Inc',
      amount: 3200.50,
      issueDate: '2024-06-14',
      dueDate: '2024-07-14',
      status: 'pending'
    },
    {
      id: 'INV-003',
      client: 'Steel Works Ltd',
      amount: 1800.75,
      issueDate: '2024-06-10',
      dueDate: '2024-07-10',
      status: 'overdue'
    },
    {
      id: 'INV-004',
      client: 'Construction Co',
      amount: 4500.00,
      issueDate: '2024-06-12',
      dueDate: '2024-07-12',
      status: 'paid'
    },
    {
      id: 'INV-005',
      client: 'Industrial Group',
      amount: 2100.25,
      issueDate: '2024-06-13',
      dueDate: '2024-07-13',
      status: 'draft'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'draft': return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-steel-600 mt-1">Create, manage, and track your invoices</p>
        </div>
        <Button className="steel-button">
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card className="steel-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-steel-400 h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-steel-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="steel-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Invoices ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-steel-200">
                  <th className="text-left py-3 px-4 font-medium text-steel-600">Invoice #</th>
                  <th className="text-left py-3 px-4 font-medium text-steel-600">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-steel-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-steel-600">Issue Date</th>
                  <th className="text-left py-3 px-4 font-medium text-steel-600">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-steel-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-steel-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-steel-100 hover:bg-steel-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{invoice.id}</td>
                    <td className="py-3 px-4 text-steel-700">{invoice.client}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{formatCurrency(invoice.amount)}</td>
                    <td className="py-3 px-4 text-steel-700">{formatDate(invoice.issueDate)}</td>
                    <td className="py-3 px-4 text-steel-700">{formatDate(invoice.dueDate)}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <div className="text-steel-400 mb-2">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices found</h3>
              <p className="text-steel-600">Try adjusting your search criteria or create a new invoice.</p>
              <Button className="mt-4 steel-button">
                <Plus className="w-4 h-4 mr-2" />
                Create First Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceManager;
