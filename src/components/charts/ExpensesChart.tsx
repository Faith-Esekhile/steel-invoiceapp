
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCompanyExpenses } from '@/hooks/useCompanyExpenses';

const ExpensesChart = () => {
  const { data: expenses = [] } = useCompanyExpenses();

  const createMonthlyExpensesData = () => {
    const monthlyData: { [key: string]: { [category: string]: number; month: string } } = {};
    
    // Initialize 12 months
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    months.forEach(month => {
      monthlyData[month] = { month };
    });

    // Group expenses by month and category
    expenses.forEach(expense => {
      const date = new Date(expense.expense_date);
      const monthName = months[date.getMonth()];
      const category = expense.category || 'Other';
      
      if (!monthlyData[monthName][category]) {
        monthlyData[monthName][category] = 0;
      }
      monthlyData[monthName][category] += Number(expense.amount);
    });

    return Object.values(monthlyData);
  };

  const data = createMonthlyExpensesData();
  
  // Get all unique categories
  const categories = Array.from(new Set(
    expenses.map(expense => expense.category || 'Other')
  ));
  
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', 
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
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
            formatter={(value: number) => [formatCurrency(value), 'Expenses']}
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
          {categories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[index % colors.length]}
              strokeWidth={3}
              dot={{ 
                fill: colors[index % colors.length], 
                strokeWidth: 2, 
                r: 5,
                stroke: '#ffffff'
              }}
              activeDot={{ 
                r: 7, 
                stroke: colors[index % colors.length],
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

export default ExpensesChart;
