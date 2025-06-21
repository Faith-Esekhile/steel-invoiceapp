
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCompanyExpenses } from '@/hooks/useCompanyExpenses';

const ExpensesChart = () => {
  const { data: expenses = [] } = useCompanyExpenses();

  const createMonthlyExpensesData = () => {
    const monthlyData: Record<string, Record<string, number | string>> = {};
    
    // Initialize 12 months
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    months.forEach(month => {
      monthlyData[month] = { month };
    });

    // Group expenses by month and category
    expenses.forEach(expense => {
      const date = new Date(expense.expense_date);
      const monthName = months[date.getMonth()];
      const category = expense.category || 'Other';
      
      if (typeof monthlyData[monthName][category] !== 'number') {
        monthlyData[monthName][category] = 0;
      }
      monthlyData[monthName][category] = (monthlyData[monthName][category] as number) + Number(expense.amount);
    });

    return Object.values(monthlyData);
  };

  const data = createMonthlyExpensesData();
  
  // Get all unique categories
  const categories = Array.from(new Set(
    expenses.map(expense => expense.category || 'Other')
  ));
  
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
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
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Monthly Expenses</h3>
        <p className="text-sm text-gray-500">Track your business expenses over time</p>
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
                <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
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
            {categories.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={false}
                activeDot={{ 
                  r: 5, 
                  stroke: colors[index % colors.length],
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

export default ExpensesChart;
