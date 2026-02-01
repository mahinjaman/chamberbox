import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAdmin, DoctorProfile } from "@/hooks/useAdmin";
import { Search, Loader2, Edit } from "lucide-react";
import { format, addMonths } from "date-fns";

const SUBSCRIPTION_TIERS = [
  { value: "trial", label: "Trial", color: "outline" },
  { value: "basic", label: "Basic", color: "secondary" },
  { value: "pro", label: "Pro", color: "default" },
  { value: "premium", label: "Premium", color: "default" },
  { value: "enterprise", label: "Enterprise", color: "default" },
] as const;

export default function SubscriptionManagement() {
  const { 
    doctors, 
    doctorsLoading, 
    updateSubscription,
    isUpdatingSubscription 
  } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [expiryMonths, setExpiryMonths] = useState<string>("1");

  const filteredDoctors = doctors?.filter((doctor) => {
    return (
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleEditSubscription = (doctor: DoctorProfile) => {
    setEditingDoctor(doctor);
    setSelectedTier(doctor.subscription_tier || "trial");
    setExpiryMonths("1");
  };

  const handleSaveSubscription = () => {
    if (!editingDoctor) return;

    const expiresAt = selectedTier === "trial" 
      ? null 
      : addMonths(new Date(), parseInt(expiryMonths)).toISOString();

    updateSubscription({
      doctorId: editingDoctor.id,
      tier: selectedTier as DoctorProfile["subscription_tier"],
      expiresAt,
    });

    setEditingDoctor(null);
  };

  const getSubscriptionStatus = (doctor: DoctorProfile) => {
    if (!doctor.subscription_tier || doctor.subscription_tier === "trial") {
      return { status: "Trial", isActive: true };
    }
    
    if (!doctor.subscription_expires_at) {
      return { status: "Active", isActive: true };
    }

    const expiryDate = new Date(doctor.subscription_expires_at);
    if (expiryDate < new Date()) {
      return { status: "Expired", isActive: false };
    }

    return { status: "Active", isActive: true };
  };

  return (
    <AdminLayout
      title="Subscription Management"
      description="Manage doctor subscriptions and plans"
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>Subscriptions</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {doctorsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors?.map((doctor) => {
                  const { status, isActive } = getSubscriptionStatus(doctor);
                  return (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doctor.full_name}</p>
                          <p className="text-sm text-muted-foreground">{doctor.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            SUBSCRIPTION_TIERS.find(t => t.value === (doctor.subscription_tier || "trial"))?.color as any || "outline"
                          }
                          className="capitalize"
                        >
                          {doctor.subscription_tier || "trial"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive ? "default" : "destructive"}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {doctor.subscription_expires_at 
                          ? format(new Date(doctor.subscription_expires_at), "MMM d, yyyy")
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSubscription(doctor)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Subscription Dialog */}
      <Dialog open={!!editingDoctor} onOpenChange={() => setEditingDoctor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="font-medium">{editingDoctor?.full_name}</p>
              <p className="text-sm text-muted-foreground">{editingDoctor?.email}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Subscription Tier</Label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_TIERS.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTier !== "trial" && (
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Select value={expiryMonths} onValueChange={setExpiryMonths}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 month</SelectItem>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDoctor(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSubscription}
              disabled={isUpdatingSubscription}
            >
              {isUpdatingSubscription && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
