
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useInvoices } from '@/hooks/useInvoices';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';

const SalesChart = () => {
  const { data: invoices = [] } = useInvoices();

  // Create monthly sales data for products
  const createMonthlySalesData = () => {
    const monthlyData: { [key: string]: { [product: string]: number; month: string } } = {};
    
    // Initialize 12 months
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
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
      
      if (!monthlyData[monthName][productType]) {
        monthlyData[monthName][productType] = 0;
      }
      monthlyData[monthName][productType] += invoice.subtotal;
    });

    return Object.values(monthlyData);
  };

  const data = createMonthlySalesData();
  const productTypes = ['Steel Fabrication', 'Metal Works', 'Small Parts'];
  const colors = ['#2563eb', '#dc2626', '#16a34a'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb"
            opacity={0.7}
          />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={formatCurrency}
            width={80}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Sales']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              fontSize: '12px'
            }}
          />
          {productTypes.map((product, index) => (
            <Line
              key={product}
              type="monotone"
              dataKey={product}
              stroke={colors[index]}
              strokeWidth={3}
              dot={{ 
                fill: colors[index], 
                strokeWidth: 2, 
                r: 5,
                stroke: '#ffffff'
              }}
              activeDot={{ 
                r: 7, 
                stroke: colors[index],
                strokeWidth: 2,
                fill: '#ffffff'
              }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
