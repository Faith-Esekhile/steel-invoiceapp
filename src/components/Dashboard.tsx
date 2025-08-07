
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Package,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInvoices, useBackdatedInvoices } from '@/hooks/useInvoices';
import { useInventory } from '@/hooks/useInventory';
import Profit from '@/components/Profit';
import SalesChart from '@/components/charts/SalesChart';
import ExpensesChart from '@/components/charts/ExpensesChart';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: invoices = [] } = useInvoices();
  const { data: backdatedInvoices = [] } = useBackdatedInvoices();
  const { data: inventory = [] } = useInventory();

  // Combine regular and backdated invoices for calculations
  const allInvoices = [...invoices, ...backdatedInvoices];

  // Calculate stats
  const totalRevenue = allInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  
  const pendingAmount = allInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
        </div>
        <Button 
          onClick={() => navigate('/invoices')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FileText className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="steel-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-steel-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-steel-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-steel-600">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">{allInvoices.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-steel-600">Inventory Items</p>
                <p className="text-2xl font-bold text-purple-600">{inventory.length}</p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <ExpensesChart />
      </div>

      {/* Profit Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profit Overview</h2>
        <Profit />
      </div>

      {/* Alerts */}
      {(overdueInvoices.length > 0 || lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {overdueInvoices.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-red-700 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Overdue Invoices ({overdueInvoices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 mb-3">You have {overdueInvoices.length} overdue invoice(s) requiring attention.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/invoices')}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  View Overdue Invoices
                </Button>
              </CardContent>
            </Card>
          )}

          {lowStockItems.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-yellow-700 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Low Stock Alert ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-600 mb-3">You have {lowStockItems.length} item(s) with low or no stock.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/inventory')}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Manage Inventory
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="steel-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No invoices created yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/invoices')}
                >
                  Create Your First Invoice
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-steel-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{invoice.invoice_number}</p>
                      <p className="text-sm text-steel-600">{invoice.clients?.company_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(invoice.total_amount)}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate('/invoices')}
                >
                  View All Invoices
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="steel-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start steel-button"
              onClick={() => navigate('/invoices')}
            >
              <FileText className="w-4 h-4 mr-3" />
              Create New Invoice
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/clients')}
            >
              <Users className="w-4 h-4 mr-3" />
              Add New Client
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/inventory')}
            >
              <Package className="w-4 h-4 mr-3" />
              Manage Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
