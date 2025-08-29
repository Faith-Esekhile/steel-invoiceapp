
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const SalesChart = () => {
  const { user } = useAuth();

  // Fetch all paid invoices and their items
  const { data: invoiceItemsData = [] } = useQuery({
    queryKey: ['sales_chart_data', user?.id],
    queryFn: async () => {
      // Fetch ALL paid invoices (regular and backdated), regardless of creator
      const { data: paidInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          issue_date,
          status,
          is_backdated,
          total_amount,
          items:invoice_items (
            quantity,
            unit_price,
            description,
            inventory:inventory_item_id ( name )
          )
        `)
        .eq('status', 'paid');

      if (invoicesError) {
        console.error('Error fetching paid invoices:', invoicesError);
        throw invoicesError;
      }

      const count = Array.isArray(paidInvoices) ? paidInvoices.length : 0;
      console.log('Found paid invoices:', count);

      if (!paidInvoices || paidInvoices.length === 0) {
        return [];
      }

      // Flatten items; fallback to invoice total when no items exist (historical invoices)
      const combinedItems = paidInvoices.flatMap((inv: any) => {
        const items = inv.items || [];
        if (items.length > 0) {
          return items.map((it: any) => ({
            ...it,
            invoice_issue_date: inv.issue_date
          }));
        }
        return [{
          description: 'Invoice Total',
          quantity: 1,
          unit_price: Number(inv.total_amount) || 0,
          inventory: null,
          invoice_issue_date: inv.issue_date
        }];
      });

      console.log('SalesChart combined items:', combinedItems.length, 'from', count, 'paid invoices');
      return combinedItems;
    },
    enabled: !!user,
  });

  const createMonthlySalesData = useMemo(() => {
    const monthlyData: Record<string, Record<string, number | string>> = {};
    
    // Initialize 12 months
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    months.forEach(month => {
      monthlyData[month] = { month };
    });

    // Calculate actual sales from invoice items using description as product name
    console.log('Processing', invoiceItemsData.length, 'invoice items for chart');
    invoiceItemsData.forEach((item: any) => {
      const issueDate = item.invoice_issue_date;
      if (issueDate) {
        const date = new Date(issueDate);
        const monthName = months[date.getMonth()];
        // Use inventory name if available, otherwise use description
        const productName = item.inventory?.name || item.description || 'Unknown Product';
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        const salesAmount = qty * price;
        
        console.log(`Adding ${salesAmount} for ${productName} in ${monthName}`);
        
        if (typeof monthlyData[monthName][productName] !== 'number') {
          monthlyData[monthName][productName] = 0;
        }
        monthlyData[monthName][productName] = (monthlyData[monthName][productName] as number) + salesAmount;
      }
    });

    console.log('Final monthly data structure:', monthlyData);
    const result = Object.values(monthlyData);
    console.log('Chart data array:', result);
    return result;
  }, [invoiceItemsData]);

  const data = createMonthlySalesData;
  
  // Get top-selling products for better visualization
  const getTopProducts = useMemo(() => {
    const productTotals: Record<string, number> = {};
    
    // Calculate total sales for each product across all months
    data.forEach(monthData => {
      Object.keys(monthData).forEach(key => {
        if (key !== 'month' && typeof monthData[key] === 'number') {
          productTotals[key] = (productTotals[key] || 0) + (monthData[key] as number);
        }
      });
    });
    
    // Sort by total sales and get top 8 products
    return Object.entries(productTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name]) => name);
  }, [data]);

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Monthly Sales by Product</h3>
        <p className="text-sm text-gray-500">Actual sales revenue per product by month (Top 8 products)</p>
      </div>
      <div className="w-full h-80">
        {getTopProducts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-sm">No sales data available</p>
              <p className="text-gray-400 text-xs mt-1">Create paid invoices to see sales analytics</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelStyle={{ color: '#1f2937', fontWeight: '500' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  backdropFilter: 'blur(8px)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              {getTopProducts.map((productName, index) => (
                <Bar
                  key={productName}
                  dataKey={productName}
                  fill={colors[index % colors.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesChart;
