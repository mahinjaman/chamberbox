import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2, Lock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { FilteredAnalyticsData } from "@/hooks/useFilteredAnalytics";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

interface AnalyticsExportProps {
  data: FilteredAnalyticsData;
  startDate: Date;
  endDate: Date;
  category: string;
  doctorName?: string;
}

export const AnalyticsExport = ({
  data,
  startDate,
  endDate,
  category,
  doctorName = "Doctor",
}: AnalyticsExportProps) => {
  const [exporting, setExporting] = useState(false);
  const { canExportData, checkFeatureAccess } = useFeatureAccess();
  const exportAccess = checkFeatureAccess("export");

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(33, 33, 33);
      doc.text("Analytics Report", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`${doctorName}`, pageWidth / 2, 28, { align: "center" });

      doc.setFontSize(10);
      doc.text(
        `Period: ${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`,
        pageWidth / 2,
        35,
        { align: "center" }
      );

      if (category !== "all") {
        doc.text(`Category: ${category}`, pageWidth / 2, 42, { align: "center" });
      }

      let yPos = 55;

      // Summary Stats
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text("Summary", 14, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: [
          ["Total Revenue", formatCurrency(data.totalRevenue)],
          ["Total Visits", data.totalVisits.toString()],
          ["New Patients", data.patientStats.newInRange.toString()],
          ["Total Patients", data.patientStats.total.toString()],
        ],
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

      // Revenue by Category
      if (data.revenueByCategory.length > 0) {
        doc.setFontSize(14);
        doc.text("Revenue by Category", 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [["Category", "Amount"]],
          body: data.revenueByCategory.map((item) => [
            item.category.charAt(0).toUpperCase() + item.category.slice(1),
            formatCurrency(item.amount),
          ]),
          theme: "striped",
          headStyles: { fillColor: [34, 197, 94] },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      }

      // Category Breakdown
      if (data.categoryBreakdown.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text("Category Breakdown (Income vs Expense)", 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [["Category", "Income", "Expense", "Net"]],
          body: data.categoryBreakdown.map((item) => [
            item.category.charAt(0).toUpperCase() + item.category.slice(1),
            formatCurrency(item.income),
            formatCurrency(item.expense),
            formatCurrency(item.income - item.expense),
          ]),
          theme: "striped",
          headStyles: { fillColor: [168, 85, 247] },
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      }

      // Top Diagnoses
      if (data.topDiagnoses.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text("Top Diagnoses", 14, yPos);
        yPos += 8;

        autoTable(doc, {
          startY: yPos,
          head: [["Diagnosis", "Count"]],
          body: data.topDiagnoses.map((item) => [item.name, item.count.toString()]),
          theme: "striped",
          headStyles: { fillColor: [249, 115, 22] },
          margin: { left: 14, right: 14 },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated on ${format(new Date(), "MMM d, yyyy HH:mm")} | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`analytics-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      const rows: string[][] = [];

      // Header
      rows.push(["Analytics Report"]);
      rows.push([`Period: ${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`]);
      if (category !== "all") {
        rows.push([`Category: ${category}`]);
      }
      rows.push([]);

      // Summary
      rows.push(["Summary"]);
      rows.push(["Metric", "Value"]);
      rows.push(["Total Revenue", formatCurrency(data.totalRevenue)]);
      rows.push(["Total Visits", data.totalVisits.toString()]);
      rows.push(["New Patients", data.patientStats.newInRange.toString()]);
      rows.push(["Total Patients", data.patientStats.total.toString()]);
      rows.push([]);

      // Revenue by Category
      if (data.revenueByCategory.length > 0) {
        rows.push(["Revenue by Category"]);
        rows.push(["Category", "Amount"]);
        data.revenueByCategory.forEach((item) => {
          rows.push([item.category, formatCurrency(item.amount)]);
        });
        rows.push([]);
      }

      // Category Breakdown
      if (data.categoryBreakdown.length > 0) {
        rows.push(["Category Breakdown"]);
        rows.push(["Category", "Income", "Expense", "Net"]);
        data.categoryBreakdown.forEach((item) => {
          rows.push([
            item.category,
            formatCurrency(item.income),
            formatCurrency(item.expense),
            formatCurrency(item.income - item.expense),
          ]);
        });
        rows.push([]);
      }

      // Top Diagnoses
      if (data.topDiagnoses.length > 0) {
        rows.push(["Top Diagnoses"]);
        rows.push(["Diagnosis", "Count"]);
        data.topDiagnoses.forEach((item) => {
          rows.push([item.name, item.count.toString()]);
        });
        rows.push([]);
      }

      // Daily Trends
      if (data.visitTrends.length > 0) {
        rows.push(["Daily Trends"]);
        rows.push(["Date", "Visits", "Revenue"]);
        data.visitTrends.forEach((item) => {
          rows.push([item.date, item.visits.toString(), formatCurrency(item.revenue)]);
        });
      }

      const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `analytics-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.click();

      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  // If user doesn't have export access, show disabled button
  if (!canExportData()) {
    return (
      <Button variant="outline" disabled title={exportAccess.message}>
        <Lock className="h-4 w-4 mr-2" />
        Export (Upgrade Required)
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting}>
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
