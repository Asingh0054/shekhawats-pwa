import { useEffect, useState } from "react";
// import { SummaryCard } from "../components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Home, UtensilsCrossed, User, Package, TrendingUp, TrendingDown } from "lucide-react";
import { ExpenseEntry } from "../components/ExpenseTable";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";

interface CategoryData {
  [key: string]: ExpenseEntry[];
}

const Dashboard = () => {
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

  const getTotalByCategory = (category: string) => {
    return expenses[category]?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
  };

  const getTotalExpenses = () => {
    return Object.values(expenses).flat().reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getLastMonthTotal = () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7);
    
    return Object.values(expenses)
      .flat()
      .filter(entry => entry.date.startsWith(lastMonthStr))
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getThisMonthTotal = () => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return Object.values(expenses)
      .flat()
      .filter(entry => entry.date.startsWith(thisMonth))
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const categories = [
    { key: 'room', title: 'Room', icon: Home, color: 'hsl(189 85% 45%)' },
    { key: 'kitchen', title: 'Kitchen', icon: UtensilsCrossed, color: 'hsl(32 95% 58%)' },
    { key: 'personal', title: 'Personal', icon: User, color: 'hsl(271 76% 53%)' },
    { key: 'misc', title: 'Misc', icon: Package, color: 'hsl(158 75% 48%)' },
  ];

  const pieData = categories.map(cat => ({
    name: cat.title,
    value: getTotalByCategory(cat.key),
    color: cat.color
  })).filter(d => d.value > 0);

  const monthlyData = (() => {
    const months: { [key: string]: number } = {};
    Object.values(expenses).flat().forEach(entry => {
      const month = entry.date.slice(0, 7);
      months[month] = (months[month] || 0) + entry.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, total]) => ({
        month: new Date(month + "-01").toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        total
      }));
  })();

  const lastMonthTotal = getLastMonthTotal();
  const thisMonthTotal = getThisMonthTotal();
  const percentageChange = lastMonthTotal > 0 
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;

  const budget = 10000; // Default budget
  const budgetPercentage = (thisMonthTotal / budget) * 100;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="This Month"
          amount={thisMonthTotal}
          icon={<Home className="h-6 w-6" />}
          gradient="linear-gradient(135deg, hsl(189 85% 45%), hsl(189 85% 60%))"
        />
        <SummaryCard
          title="Last Month"
          amount={lastMonthTotal}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Change</p>
                <p className={`text-2xl font-bold ${percentageChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                </p>
              </div>
              {percentageChange >= 0 ? (
                <TrendingUp className="h-8 w-8 text-red-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium">₹{thisMonthTotal.toFixed(0)} / ₹{budget}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${budgetPercentage > 100 ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                <Bar dataKey="total" fill="hsl(189 85% 45%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
              <Line type="monotone" dataKey="total" stroke="hsl(189 85% 45%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <SummaryCard
            key={category.key}
            title={category.title}
            amount={getTotalByCategory(category.key)}
            icon={<category.icon className="h-6 w-6" />}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
