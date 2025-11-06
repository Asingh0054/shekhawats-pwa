import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Zap, Upload, Calendar, Bell, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface ElectricityBill {
  id: string;
  date: string;
  amount: number;
  imageUrl?: string;
  notes: string;
}

const ElectricityBills = () => {
  const [bills, setBills] = useState<ElectricityBill[]>([]);
  const [newBill, setNewBill] = useState({ date: new Date().toISOString().split('T')[0], amount: '', notes: '' });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('electricityBills');
    if (saved) {
      try {
        setBills(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load bills:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('electricityBills', JSON.stringify(bills));
  }, [bills]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addBill = () => {
    if (!newBill.amount) {
      toast.error("Please enter bill amount");
      return;
    }

    const bill: ElectricityBill = {
      id: Date.now().toString(),
      date: newBill.date,
      amount: parseFloat(newBill.amount),
      imageUrl: imagePreview,
      notes: newBill.notes,
    };

    setBills([...bills, bill]);
    setNewBill({ date: new Date().toISOString().split('T')[0], amount: '', notes: '' });
    setImagePreview('');
    toast.success("Bill added successfully!");
  };

  const deleteBill = (id: string) => {
    setBills(bills.filter(b => b.id !== id));
    toast.success("Bill deleted");
  };

  const getAverage = () => {
    if (bills.length === 0) return 0;
    const last6Months = bills.slice(-6);
    return last6Months.reduce((sum, bill) => sum + bill.amount, 0) / last6Months.length;
  };

  const getDaysUntilMonthEnd = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const diff = Math.ceil((lastDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysUntilMonthEnd();
  const showReminder = daysLeft <= 5;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Electricity Bills
        </h1>
        <p className="text-muted-foreground">Track and manage your electricity expenses</p>
      </div>

      {/* Reminder Alert */}
      {showReminder && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Payment Reminder
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-200">
                  {daysLeft} days left until month end. Average bill: ₹{getAverage().toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Bill</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{getAverage().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Last {Math.min(bills.length, 6)} months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
            <p className="text-xs text-muted-foreground">Records saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysLeft} days</div>
            <p className="text-xs text-muted-foreground">Until month end</p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Bill */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Bill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newBill.date}
                onChange={(e) => setNewBill({ ...newBill, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={newBill.amount}
                onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Additional notes"
              value={newBill.notes}
              onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="image">Upload Bill Image</Label>
            <div className="flex items-center gap-4 mt-2">
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="image" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </label>
              </Button>
              <Input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {imagePreview && <span className="text-sm text-muted-foreground">Image selected</span>}
            </div>
            {imagePreview && (
              <img src={imagePreview} alt="Bill preview" className="mt-4 max-w-xs rounded-lg border" />
            )}
          </div>

          <Button onClick={addBill} variant="gradient" className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Add Bill
          </Button>
        </CardContent>
      </Card>

      {/* Bills History */}
      <Card>
        <CardHeader>
          <CardTitle>Bills History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bills.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No bills recorded yet</p>
            ) : (
              bills.slice().reverse().map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {bill.imageUrl && (
                      <img src={bill.imageUrl} alt="Bill" className="w-16 h-16 object-cover rounded" />
                    )}
                    <div>
                      <p className="font-semibold">₹{bill.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{new Date(bill.date).toLocaleDateString()}</p>
                      {bill.notes && <p className="text-sm text-muted-foreground">{bill.notes}</p>}
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteBill(bill.id)}>
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectricityBills;
