import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Construction } from "lucide-react";

const Finances = () => {
  return (
    <DashboardLayout
      title="Financial Tracking"
      description="Track your chamber earnings, dues, and expenses"
    >
      <Card>
        <CardContent className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-accent/10 mx-auto mb-6 flex items-center justify-center">
            <CreditCard className="w-10 h-10 text-accent" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Construction className="w-5 h-5 text-warning" />
            <h3 className="text-xl font-semibold text-foreground">Coming Soon</h3>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Financial tracking with daily earnings, dues management, expense tracking, 
            and payment integration (bKash, Nagad) is coming in the next update.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Finances;
