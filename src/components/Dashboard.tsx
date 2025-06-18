
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertCircle,
  Download
} from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { data: invoices = [] } = useInvoices();
  const { data: clients = [] } = useClients();

  const handleQuickAction = (action: string) => {
    console.log(`Executing quick action: ${action}`);
    switch (action) {
      case 'new-invoice':
        onNavigate('invoices');
        break;
      case 'add-client':
        onNavigate('clients');
        break;
      case 'generate-report':
        // Generate and download a simple CSV report
        const csvContent = generateReport();
        downloadCSV(csvContent, 'marvellous-steel-report.csv');
        break;
      case 'payment-reminders':
        const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
        alert(`Found ${overdueInvoices.length} overdue invoices. Email reminders would be sent in a real system.`);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const generateReport = () => {
    const headers = ['Invoice Number', 'Client', 'Amount', 'Status', 'Issue Date', 'Due Date'];
    const rows = invoices.map(invoice => [
      invoice.invoice_number,
      invoice.clients?.company_name || 'Unknown',
      `$${invoice.total_amount.toFixed(2)}`,
      invoice.status,
      invoice.issue_date,
      invoice.due_date
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Calculate dashboard statistics
  const totalRevenue = invoices.reduce((sum, invoice) => 
    invoice.status === 'paid' ? sum + invoice.total_amount : sum, 0
  );
  
  const pendingAmount = invoices.reduce((sum, invoice) => 
    invoice.status === 'pending' ? sum + invoice.total_amount : sum, 0
  );
  
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue');
  const recentInvoices = invoices.slice(0, 5);

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
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to Marvellous Steel Enterprise</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-purple-600">{clients.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-auto p-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleQuickAction('new-invoice')}
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">New Invoice</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('add-client')}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm font-medium">Add Client</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('generate-report')}
            >
              <Download className="w-6 h-6" />
              <span className="text-sm font-medium">Generate Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleQuickAction('payment-reminders')}
            >
              <AlertCircle className="w-6 h-6" />
              <span className="text-sm font-medium">Payment Reminders</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Invoices</span>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('invoices')}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No invoices yet</p>
                <Button 
                  size="sm" 
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleQuickAction('new-invoice')}
                >
                  Create First Invoice
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-gray-600">{invoice.clients?.company_name || 'Unknown Client'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueInvoices.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">
                      {overdueInvoices.length} Overdue Invoice{overdueInvoices.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    Send payment reminders to avoid delays
                  </p>
                </div>
              )}
              
              {invoices.filter(inv => inv.status === 'pending').length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">
                      {invoices.filter(inv => inv.status === 'pending').length} Pending Payment{invoices.filter(inv => inv.status === 'pending').length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    Follow up with clients for faster payments
                  </p>
                </div>
              )}
              
              {clients.length === 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">
                      No Clients Added
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Add your first client to start creating invoices
                  </p>
                </div>
              )}
              
              {overdueInvoices.length === 0 && invoices.filter(inv => inv.status === 'pending').length === 0 && clients.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">
                      All Systems Running Smoothly
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    No urgent actions required
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
