
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, FileText, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { data: invoices = [] } = useInvoices();
  const { data: clients = [] } = useClients();

  // Calculate stats from real data
  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
  const overdueInvoices = invoices.filter(invoice => {
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    return invoice.status === 'pending' && dueDate < today;
  }).length;

  const monthlyRevenue = invoices
    .filter(invoice => {
      const issueDate = new Date(invoice.issue_date);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return invoice.status === 'paid' && 
             issueDate.getMonth() === currentMonth && 
             issueDate.getFullYear() === currentYear;
    })
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

  const recentInvoices = invoices.slice(0, 5);

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

  const handleGenerateReport = () => {
    // Generate a simple CSV report
    const csvContent = [
      ['Invoice Number', 'Client', 'Amount', 'Status', 'Issue Date'],
      ...invoices.map(invoice => [
        invoice.invoice_number,
        invoice.clients?.company_name || 'Unknown',
        invoice.total_amount,
        invoice.status,
        invoice.issue_date
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePaymentReminders = () => {
    const overdueInvoicesList = invoices.filter(invoice => {
      const dueDate = new Date(invoice.due_date);
      const today = new Date();
      return invoice.status === 'pending' && dueDate < today;
    });

    if (overdueInvoicesList.length === 0) {
      alert('No overdue invoices found!');
    } else {
      const reminderText = overdueInvoicesList.map(invoice => 
        `Invoice ${invoice.invoice_number} - ${invoice.clients?.company_name} - ${formatCurrency(invoice.total_amount)}`
      ).join('\n');
      
      alert(`Payment Reminders Needed:\n\n${reminderText}`);
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
          <Button className="steel-button" onClick={() => onNavigate('invoices')}>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
          <Button variant="outline" onClick={() => onNavigate('clients')}>
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
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {invoices.filter(i => i.status === 'paid').length} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-steel-600">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-steel-500 mt-1">
              {pendingInvoices} invoices pending
            </p>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-steel-600">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
            <p className="text-xs text-steel-500 mt-1">
              {pendingInvoices} pending payment
            </p>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-steel-600">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
            <p className="text-xs text-steel-500 mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overdueInvoices > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  {overdueInvoices} Overdue Invoice{overdueInvoices !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-red-600 mt-1">
                  Please follow up on overdue payments to maintain cash flow.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => onNavigate('invoices')}
              >
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
              {recentInvoices.length === 0 ? (
                <p className="text-steel-600 text-center py-4">No invoices yet</p>
              ) : (
                recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-steel-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                      <p className="text-sm text-steel-600">{invoice.clients?.company_name || 'Unknown Client'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(invoice.total_amount)}</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => onNavigate('invoices')}>
              View All Invoices
            </Button>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start steel-button" onClick={() => onNavigate('invoices')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('clients')}>
              <Users className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleGenerateReport}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handlePaymentReminders}>
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
