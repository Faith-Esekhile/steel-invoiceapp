
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, FileText, Users, DollarSign, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  // Mock data - in real app, this would come from Supabase
  const stats = {
    totalRevenue: 125430,
    monthlyRevenue: 23450,
    totalInvoices: 156,
    pendingInvoices: 12,
    totalClients: 28,
    overdueInvoices: 3
  };

  const recentInvoices = [
    { id: 'INV-001', client: 'Acme Corp', amount: 2500, status: 'paid', date: '2024-06-15' },
    { id: 'INV-002', client: 'Tech Solutions', amount: 3200, status: 'pending', date: '2024-06-14' },
    { id: 'INV-003', client: 'Steel Works Ltd', amount: 1800, status: 'overdue', date: '2024-06-10' },
    { id: 'INV-004', client: 'Construction Co', amount: 4500, status: 'paid', date: '2024-06-12' },
    { id: 'INV-005', client: 'Industrial Group', amount: 2100, status: 'pending', date: '2024-06-13' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-steel-600 mt-1">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex gap-3">
          <Button className="steel-button">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="steel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-steel-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-steel-600">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-steel-500 mt-1">
              {stats.pendingInvoices} invoices pending
            </p>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-steel-600">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</div>
            <p className="text-xs text-steel-500 mt-1">
              {stats.pendingInvoices} pending payment
            </p>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-steel-600">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalClients}</div>
            <p className="text-xs text-steel-500 mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.overdueInvoices > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  {stats.overdueInvoices} Overdue Invoice{stats.overdueInvoices !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-red-600 mt-1">
                  Please follow up on overdue payments to maintain cash flow.
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                View Overdue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="steel-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-steel-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.id}</p>
                    <p className="text-sm text-steel-600">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Invoices
            </Button>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start steel-button">
              <Plus className="w-4 h-4 mr-2" />
              Create New Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Payment Reminders
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
