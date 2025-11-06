import { useState, useEffect } from "react";
import { ExpenseTable, ExpenseEntry } from "../components/ExpenseTable";
import { SummaryCard } from "../components/SummaryCard";
import { Button } from "../components/ui/button";
import { Home, UtensilsCrossed, User, Package, Download, Calendar, FileText, Share2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CategoryData {
  [key: string]: ExpenseEntry[];
}

const Expenses = () => {
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

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const updateCategory = (category: string, entries: ExpenseEntry[]) => {
    setExpenses(prev => ({
      ...prev,
      [category]: entries,
    }));
  };

  const getTotalByCategory = (category: string) => {
    return expenses[category].reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getTotalExpenses = () => {
    return Object.values(expenses).flat().reduce((sum, entry) => sum + entry.amount, 0);
  };

  const exportToCSV = () => {
    const headers = ['Category', 'S.No', 'Date', 'Item', 'Quantity', 'Unit', 'Expense', 'Remarks'];
    const rows: string[] = [headers.join(',')];

    categories.forEach(category => {
      const categoryEntries = expenses[category.key];
      categoryEntries.forEach((entry, index) => {
        rows.push([
          category.title,
          (index + 1).toString(),
          entry.date,
          `"${entry.item}"`,
          entry.quantity.toString(),
          entry.quantityUnit,
          entry.amount.toString(),
          `"${entry.remarks}"`
        ].join(','));
      });
      
      const categoryTotal = getTotalByCategory(category.key);
      rows.push([
        `${category.title} Total`,
        '',
        '',
        '',
        '',
        '',
        categoryTotal.toFixed(2),
        ''
      ].join(','));
      rows.push('');
    });

    rows.push([
      'Overall Total',
      '',
      '',
      '',
      '',
      '',
      getTotalExpenses().toFixed(2),
      ''
    ].join(','));

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("CSV exported successfully!");
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(20);
    doc.text('Home Expense Tracker', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), pageWidth / 2, 22, { align: 'center' });
    
    let yPosition = 30;

    categories.forEach((category, catIndex) => {
      const categoryEntries = expenses[category.key];
      
      if (categoryEntries.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(category.title, 14, yPosition);
        yPosition += 5;

        const tableData = categoryEntries.map((entry, index) => [
          (index + 1).toString(),
          entry.date,
          entry.item,
          `${entry.quantity} ${entry.quantityUnit}`,
          `₹${entry.amount.toFixed(2)}`,
          entry.remarks
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['S.No', 'Date', 'Item', 'Quantity', 'Expense', 'Remarks']],
          body: tableData,
          foot: [[{ content: `${category.title} Total: ₹${getTotalByCategory(category.key).toFixed(2)}`, colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } }]],
          theme: 'striped',
          headStyles: { fillColor: [41, 128, 185] },
          footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          margin: { left: 14, right: 14 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;

        if (catIndex < categories.length - 1 && yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      }
    });

    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Total: ₹${getTotalExpenses().toFixed(2)}`, pageWidth - 14, yPosition, { align: 'right' });

    return doc;
  };

  const savePDF = () => {
    const doc = generatePDF();
    doc.save(`expenses-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF saved successfully!");
  };

  const shareToWhatsApp = () => {
    const doc = generatePDF();
    const pdfBlob = doc.output('blob');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const message = `Home Expense Tracker - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n\nTotal Expenses: ₹${getTotalExpenses().toFixed(2)}\n\nDownload the PDF for detailed breakdown.`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      toast.info("Opening WhatsApp... Please share the PDF manually from your downloads.");
    };
    reader.readAsDataURL(pdfBlob);
    
    doc.save(`expenses-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const categories = [
    { key: 'room', title: 'Room Expenses', icon: Home, color: 'linear-gradient(135deg, hsl(189 85% 45%), hsl(189 85% 60%))' },
    { key: 'kitchen', title: 'Kitchen Expenses', icon: UtensilsCrossed, color: 'linear-gradient(135deg, hsl(32 95% 58%), hsl(32 95% 70%))' },
    { key: 'personal', title: 'Personal Expenses', icon: User, color: 'linear-gradient(135deg, hsl(271 76% 53%), hsl(271 76% 65%))' },
    { key: 'misc', title: 'Miscellaneous', icon: Package, color: 'linear-gradient(135deg, hsl(158 75% 48%), hsl(158 75% 60%))' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Expense Management
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            onClick={savePDF}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button
            onClick={shareToWhatsApp}
            variant="gradient"
            size="sm"
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Expenses"
          amount={getTotalExpenses()}
          icon={<Calendar className="h-6 w-6" />}
          gradient="linear-gradient(135deg, hsl(189 85% 45%), hsl(189 85% 60%))"
        />
        <SummaryCard
          title="Room"
          amount={getTotalByCategory('room')}
          icon={<Home className="h-6 w-6" />}
        />
        <SummaryCard
          title="Kitchen"
          amount={getTotalByCategory('kitchen')}
          icon={<UtensilsCrossed className="h-6 w-6" />}
        />
        <SummaryCard
          title="Personal"
          amount={getTotalByCategory('personal')}
          icon={<User className="h-6 w-6" />}
        />
      </div>

      {/* Expense Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => (
          <ExpenseTable
            key={category.key}
            title={category.title}
            entries={expenses[category.key]}
            onUpdate={(entries) => updateCategory(category.key, entries)}
            categoryColor={category.color}
          />
        ))}
      </div>
    </div>
  );
};

export default Expenses;
