
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useInvoices } from '@/hooks/useInvoices';

const SalesChart = () => {
  const { data: invoices = [] } = useInvoices();

  // Process data to get sales by month
  const salesByMonth = React.useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    
    invoices
      .filter(invoice => invoice.status === 'paid')
      .forEach(invoice => {
        const date = new Date(invoice.issue_date);
        const monthKey = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + invoice.total_amount;
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
        sales: monthlyData[monthKey] || 0
      });
    }
    
    return months;
  }, [invoices]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card className="steel-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Product Sales by Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={salesByMonth}>
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
              formatter={(value) => [formatCurrency(Number(value)), 'Sales']}
            />
            <Bar 
              dataKey="sales" 
              fill="var(--color-sales)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
