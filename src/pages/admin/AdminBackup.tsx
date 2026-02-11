import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseBackup, FileCode2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingSchema, setIsExportingSchema] = useState(false);

  const handleBackup = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-database");
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chamberbox_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Database backup downloaded successfully!");
    } catch (err: any) {
      console.error("Backup failed:", err);
      toast.error("Backup failed: " + (err.message || "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleSchemaExport = async () => {
    setIsExportingSchema(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-schema", {
        headers: { Accept: "application/sql" },
      });
      if (error) throw error;

      const sqlContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      const blob = new Blob([sqlContent], { type: "application/sql" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chamberbox_schema_${new Date().toISOString().split("T")[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Schema downloaded successfully!");
    } catch (err: any) {
      console.error("Schema export failed:", err);
      toast.error("Schema export failed: " + (err.message || "Unknown error"));
    } finally {
      setIsExportingSchema(false);
    }
  };

  return (
    <AdminLayout
      title="Database Backup"
      description="Export database data or schema for migration"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseBackup className="h-5 w-5 text-primary" />
              Full Database Backup
            </CardTitle>
            <CardDescription>
              সম্পূর্ণ ডাটাবেস JSON ফাইল হিসেবে ডাউনলোড করুন। এতে সব টেবিলের সব ডাটা এবং SQL restore script অন্তর্ভুক্ত থাকবে।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackup} disabled={isExporting} className="w-full">
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <DatabaseBackup className="h-4 w-4 mr-2" />
                  Download Full Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-primary" />
              Schema Only Export
            </CardTitle>
            <CardDescription>
              শুধুমাত্র টেবিল structure, RLS policies, functions, triggers ইত্যাদি .sql ফাইল হিসেবে ডাউনলোড করুন — কোনো ডাটা ছাড়া। নতুন Supabase project এ সরাসরি import করা যাবে।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSchemaExport} disabled={isExportingSchema} variant="outline" className="w-full">
              {isExportingSchema ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileCode2 className="h-4 w-4 mr-2" />
                  Download Schema (.sql)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
