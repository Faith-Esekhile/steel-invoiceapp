
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useCompanyExpenses } from '@/hooks/useCompanyExpenses';

const Profit = () => {
  const { data: invoices = [] } = useInvoices();
  const { data: expenses = [] } = useCompanyExpenses();

  // Calculate total revenue from paid invoices
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate profit (revenue - expenses)
  const profit = totalRevenue - totalExpenses;
  const isPositive = profit >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Revenue Card */}
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

      {/* Expenses Card */}
      <Card className="steel-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-steel-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Profit Card */}
      <Card className="steel-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-steel-600">Net Profit</p>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(profit)}
              </p>
            </div>
            <DollarSign className={`w-8 h-8 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </CardContent>
      </Card>

      {/* Profit Margin Card */}
      <Card className="steel-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-steel-600">Profit Margin</p>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {totalRevenue > 0 ? `${((profit / totalRevenue) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            {isPositive ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-600" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profit;
