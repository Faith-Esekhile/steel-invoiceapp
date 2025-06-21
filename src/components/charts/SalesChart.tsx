
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInvoices } from '@/hooks/useInvoices';

const SalesChart = () => {
  const { data: invoices = [] } = useInvoices();

  // Create monthly sales data for products
  const createMonthlySalesData = () => {
    const monthlyData: Record<string, Record<string, number | string>> = {};
    
    // Initialize 12 months
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    months.forEach(month => {
      monthlyData[month] = { month };
    });

    // Process paid invoices only
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
    
    paidInvoices.forEach(invoice => {
      const date = new Date(invoice.issue_date);
      const monthName = months[date.getMonth()];
      
      // For simplicity, we'll use generic product categories
      // In a real app, you'd get this from invoice_items
      const productType = invoice.subtotal > 100000 ? 'Steel Fabrication' : 
                         invoice.subtotal > 50000 ? 'Metal Works' : 'Small Parts';
      
      if (typeof monthlyData[monthName][productType] !== 'number') {
        monthlyData[monthName][productType] = 0;
      }
      monthlyData[monthName][productType] = (monthlyData[monthName][productType] as number) + invoice.subtotal;
    });

    return Object.values(monthlyData);
  };

  const data = createMonthlySalesData();
  const productTypes = ['Steel Fabrication', 'Metal Works', 'Small Parts'];
  const colors = ['#3b82f6', '#10b981', '#f59e0b'];

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
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Monthly Sales</h3>
        <p className="text-sm text-gray-500">Monitor your sales performance by category</p>
      </div>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              {colors.map((color, index) => (
                <linearGradient key={index} id={`salesGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
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
            {productTypes.map((product, index) => (
              <Line
                key={product}
                type="monotone"
                dataKey={product}
                stroke={colors[index]}
                strokeWidth={3}
                dot={false}
                activeDot={{ 
                  r: 5, 
                  stroke: colors[index],
                  strokeWidth: 3,
                  fill: '#ffffff',
                  filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
