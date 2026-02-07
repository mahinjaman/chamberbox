import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { format } from "date-fns";

export default function PaymentHistory() {
  const { profile } = useProfile();
  const { language } = useLanguage();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["my-subscription-payments", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_payments")
        .select("*")
        .eq("doctor_id", profile!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "verified": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {language === "bn" ? "পেমেন্ট হিস্ট্রি" : "Payment History"}
          </h1>
          <p className="text-muted-foreground">
            {language === "bn" ? "আপনার সাবস্ক্রিপশন পেমেন্টের তালিকা" : "Your subscription payment records"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !payments || payments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === "bn" ? "কোনো পেমেন্ট পাওয়া যায়নি" : "No payments found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold capitalize">{payment.plan_tier}</span>
                      <Badge variant="outline" className="text-xs">{payment.billing_period}</Badge>
                      <Badge variant={statusColor(payment.status)}>{payment.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.payment_method} • TxnID: {payment.transaction_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payment.created_at), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">৳{payment.amount}</p>
                    {payment.verified_at && (
                      <p className="text-xs text-muted-foreground">
                        {language === "bn" ? "যাচাই:" : "Verified:"} {format(new Date(payment.verified_at), "dd MMM yyyy")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
