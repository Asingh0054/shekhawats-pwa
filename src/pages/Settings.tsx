import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Settings as SettingsIcon, Moon, Sun, Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Settings = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast.success(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`);
  };

  const exportAllData = () => {
    const expenses = localStorage.getItem('expenses');
    const bills = localStorage.getItem('electricityBills');
    
    const data = {
      expenses: expenses ? JSON.parse(expenses) : {},
      electricityBills: bills ? JSON.parse(bills) : [],
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully!");
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('expenses');
      localStorage.removeItem('electricityBills');
      toast.success("All data cleared");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme-toggle">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <Switch
              id="theme-toggle"
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export or clear your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <Button onClick={exportAllData} variant="outline" className="w-full justify-start gap-2">
                <Download className="h-4 w-4" />
                Export All Data
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Download a backup of all your expenses and bills
              </p>
            </div>
            
            <div>
              <Button onClick={clearAllData} variant="destructive" className="w-full justify-start gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Permanently delete all data from the app
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">App Name</span>
            <span className="text-sm font-medium">Home Expense Tracker</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
