
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useCompanyExpenses } from '@/hooks/useCompanyExpenses';

const ExpensesChart = () => {
  const { data: expenses = [] } = useCompanyExpenses();

  // Process data to get expenses by month
  const expensesByMonth = React.useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.expense_date);
      const monthKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
    });

    // Get last 6 months
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      months.push({
        month: monthKey,
        expenses: monthlyData[monthKey] || 0
      });
    }
    
    return months;
  }, [expenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartConfig = {
    expenses: {
      label: "Expenses",
      color: "hsl(var(--destructive))",
    },
  };

  return (
    <Card className="steel-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Expenses by Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={expensesByMonth}>
            <XAxis 
              dataKey="month" 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              className="text-xs"
              tickFormatter={formatCurrency}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value) => [formatCurrency(Number(value)), 'Expenses']}
            />
            <Line 
              type="monotone"
              dataKey="expenses" 
              stroke="var(--color-expenses)"
              strokeWidth={3}
              dot={{ fill: "var(--color-expenses)", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ExpensesChart;
