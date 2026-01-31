import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Construction } from "lucide-react";

const Prescriptions = () => {
  return (
    <DashboardLayout
      title="Prescriptions"
      description="Create and manage digital prescriptions"
    >
      <Card>
        <CardContent className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Construction className="w-5 h-5 text-warning" />
            <h3 className="text-xl font-semibold text-foreground">Coming Soon</h3>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Digital prescription creation with bilingual support (Bangla/English), 
            smart medicine search, and customizable templates is coming in the next update.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Prescriptions;
