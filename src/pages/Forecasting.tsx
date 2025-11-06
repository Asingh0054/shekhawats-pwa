import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";
import { ExpenseEntry } from "../components/ExpenseTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CategoryData {
  [key: string]: ExpenseEntry[];
}

const Forecasting = () => {
  const [expenses, setExpenses] = useState<CategoryData>({
    room: [],
    kitchen: [],
    personal: [],
    misc: [],
  });

  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load expenses:', e);
      }
    }
  }, []);

  const getMonthlyData = () => {
    const months: { [key: string]: number } = {};
    Object.values(expenses).flat().forEach(entry => {
      const month = entry.date.slice(0, 7);
      months[month] = (months[month] || 0) + entry.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({
        month: new Date(month + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        actual: total
      }));
  };

  const getCategoryTrend = (category: string) => {
    const months: { [key: string]: number } = {};
    expenses[category]?.forEach(entry => {
      const month = entry.date.slice(0, 7);
      months[month] = (months[month] || 0) + entry.amount;
    });
    const values = Object.values(months);
    if (values.length < 2) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const lastMonth = values[values.length - 1];
    return ((lastMonth - avg) / avg) * 100;
  };

  const predictNextMonth = () => {
    const monthlyData = getMonthlyData();
    if (monthlyData.length < 2) return 0;
    
    const values = monthlyData.map(d => d.actual);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Simple linear trend
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    values.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    
    const n = values.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return slope * n + intercept;
  };

  const monthlyData = getMonthlyData();
  const prediction = predictNextMonth();
  const currentAvg = monthlyData.length > 0 
    ? monthlyData.reduce((sum, d) => sum + d.actual, 0) / monthlyData.length 
    : 0;
  const overspending = prediction > currentAvg ? prediction - currentAvg : 0;

  const categories = [
    { key: 'room', title: 'Room', color: 'hsl(189 85% 45%)' },
    { key: 'kitchen', title: 'Kitchen', color: 'hsl(32 95% 58%)' },
    { key: 'personal', title: 'Personal', color: 'hsl(271 76% 53%)' },
    { key: 'misc', title: 'Miscellaneous', color: 'hsl(158 75% 48%)' },
  ];

  const forecastData = [
    ...monthlyData,
    {
      month: 'Forecast',
      actual: undefined,
      predicted: prediction
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Expense Forecasting
        </h1>
        <p className="text-muted-foreground">AI-powered predictions based on your spending patterns</p>
      </div>

      {/* Prediction Alert */}
      {overspending > 0 ? (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">
                  Overspending Alert!
                </p>
                <p className="text-sm text-red-700 dark:text-red-200">
                  You're predicted to overspend by ₹{overspending.toFixed(2)} next month if current trends continue.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  On Track!
                </p>
                <p className="text-sm text-green-700 dark:text-green-200">
                  Your spending is within expected range. Keep it up!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value?.toFixed(2) || 0}`} />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="hsl(189 85% 45%)" strokeWidth={2} name="Actual" />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="hsl(32 95% 58%)" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                name="Predicted"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const trend = getCategoryTrend(category.key);
          const isIncreasing = trend > 5;
          const isDecreasing = trend < -5;
          
          return (
            <Card key={category.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{category.title}</CardTitle>
                {isIncreasing ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : isDecreasing ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isIncreasing ? 'text-red-500' : isDecreasing ? 'text-green-500' : ''}`}>
                  {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {isIncreasing ? 'Spending increasing' : isDecreasing ? 'Spending decreasing' : 'Stable spending'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border-l-4 border-primary bg-primary/5 rounded">
            <p className="font-semibold">Next Month Prediction</p>
            <p className="text-sm text-muted-foreground">
              Based on your spending patterns, we predict your total expenses next month will be approximately ₹{prediction.toFixed(2)}
            </p>
          </div>
          
          <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 rounded">
            <p className="font-semibold">Average Monthly Spending</p>
            <p className="text-sm text-muted-foreground">
              Your average monthly spending is ₹{currentAvg.toFixed(2)}
            </p>
          </div>

          {categories.map(cat => {
            const trend = getCategoryTrend(cat.key);
            if (Math.abs(trend) > 10) {
              return (
                <div key={cat.key} className="p-4 border-l-4 border-accent bg-accent/5 rounded">
                  <p className="font-semibold">{cat.title} Trend</p>
                  <p className="text-sm text-muted-foreground">
                    {trend > 0 ? 'Increasing' : 'Decreasing'} by {Math.abs(trend).toFixed(1)}% compared to average
                  </p>
                </div>
              );
            }
            return null;
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default Forecasting;
