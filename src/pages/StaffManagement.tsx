import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStaff, StaffMember, StaffRole } from "@/hooks/useStaff";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { Plus, Users, Pencil, Trash2, Building2, Shield, Mail, KeyRound, Info, AlertTriangle } from "lucide-react";
import { AddStaffDialog } from "@/components/staff/AddStaffDialog";
import { EditStaffDialog } from "@/components/staff/EditStaffDialog";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { permissionDescriptions } from "@/lib/staff-permissions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const roleColors: Record<StaffRole, string> = {
  receptionist: "bg-blue-100 text-blue-800",
  assistant: "bg-green-100 text-green-800",
  manager: "bg-purple-100 text-purple-800",
};

const roleLabels: Record<StaffRole, { en: string; bn: string }> = {
  receptionist: { en: "Receptionist", bn: "রিসেপশনিস্ট" },
  assistant: { en: "Assistant", bn: "সহকারী" },
  manager: { en: "Manager", bn: "ম্যানেজার" },
};

export default function StaffManagement() {
  const { t, language } = useLanguage();
  const { staffMembers, staffLoading, deleteStaff, isDeletingStaff, sendPasswordReset, isSendingPasswordReset } = useStaff();
  const { chambers } = useProfile();
  const { currentPlan, canAddMore } = useSubscription();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [sendingResetTo, setSendingResetTo] = useState<string | null>(null);

  const staffCount = staffMembers?.length || 0;
  const maxStaff = currentPlan?.max_staff || 0;
  const canAddStaff = canAddMore('staff', staffCount);
  const staffLimitReached = !canAddStaff && maxStaff !== -1;

  const handleDelete = () => {
    if (deletingStaff) {
      deleteStaff(deletingStaff.id);
      setDeletingStaff(null);
    }
  };

  const handleSendPasswordReset = (email: string) => {
    setSendingResetTo(email);
    sendPasswordReset(email, {
      onSettled: () => setSendingResetTo(null),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === "bn" ? "স্টাফ ম্যানেজমেন্ট" : "Staff Management"}
            </h1>
            <p className="text-muted-foreground">
              {language === "bn" 
                ? "আপনার চেম্বারের জন্য স্টাফ যোগ করুন এবং পরিচালনা করুন"
                : "Add and manage staff for your chambers"}
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    onClick={() => setAddDialogOpen(true)}
                    disabled={staffLimitReached}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {language === "bn" ? "স্টাফ যোগ করুন" : "Add Staff"}
                  </Button>
                </span>
              </TooltipTrigger>
              {staffLimitReached && (
                <TooltipContent>
                  <p>
                    {language === "bn" 
                      ? `আপনার প্ল্যানে সর্বাধিক ${maxStaff} জন স্টাফ যোগ করা যায়। আপগ্রেড করুন।`
                      : `Your plan allows maximum ${maxStaff} staff. Upgrade to add more.`}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Staff Limit Warning */}
        {staffLimitReached && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="py-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {language === "bn" 
                    ? `স্টাফ সীমা পূর্ণ (${staffCount}/${maxStaff})`
                    : `Staff limit reached (${staffCount}/${maxStaff})`}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {language === "bn" 
                    ? "আরও স্টাফ যোগ করতে আপনার প্ল্যান আপগ্রেড করুন।"
                    : "Upgrade your plan to add more staff members."}
                </p>
              </div>
              <Button size="sm" variant="outline" className="border-amber-400">
                {language === "bn" ? "আপগ্রেড" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{staffMembers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "মোট স্টাফ" : "Total Staff"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {staffMembers?.filter(s => s.is_active).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "সক্রিয় স্টাফ" : "Active Staff"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{chambers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "চেম্বার" : "Chambers"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle>{language === "bn" ? "স্টাফ তালিকা" : "Staff List"}</CardTitle>
          </CardHeader>
          <CardContent>
            {staffLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === "bn" ? "লোড হচ্ছে..." : "Loading..."}
              </div>
            ) : !staffMembers?.length ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === "bn" 
                    ? "এখনও কোনো স্টাফ যোগ করা হয়নি"
                    : "No staff members added yet"}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {language === "bn" ? "প্রথম স্টাফ যোগ করুন" : "Add Your First Staff"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {staffMembers.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex flex-col sm:flex-row sm:items-start justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{staff.full_name}</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge className={`${roleColors[staff.role]} cursor-help`}>
                                {roleLabels[staff.role][language]}
                                <Info className="w-3 h-3 ml-1" />
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold mb-1">
                                {language === "bn" ? "অনুমতি:" : "Permissions:"}
                              </p>
                              <ul className="text-xs space-y-1">
                                {permissionDescriptions[language][staff.role].map((perm, idx) => (
                                  <li key={idx}>• {perm}</li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {!staff.is_active && (
                          <Badge variant="secondary">
                            {language === "bn" ? "নিষ্ক্রিয়" : "Inactive"}
                          </Badge>
                        )}
                        {!staff.user_id && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            {language === "bn" ? "সাইন আপ হয়নি" : "Not Signed Up"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{staff.email}</p>
                      {staff.phone && (
                        <p className="text-sm text-muted-foreground">{staff.phone}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {staff.chamber_access?.map((access) => (
                          <Badge key={access.id} variant="outline" className="text-xs">
                            <Building2 className="w-3 h-3 mr-1" />
                            {access.chamber?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendPasswordReset(staff.email)}
                              disabled={sendingResetTo === staff.email}
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {language === "bn" 
                              ? "পাসওয়ার্ড সেটআপ/রিসেট ইমেইল পাঠান"
                              : "Send password setup/reset email"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingStaff(staff)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingStaff(staff)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Staff Dialog */}
      <AddStaffDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        chambers={chambers || []}
      />

      {/* Edit Staff Dialog */}
      {editingStaff && (
        <EditStaffDialog
          open={!!editingStaff}
          onOpenChange={(open) => !open && setEditingStaff(null)}
          staff={editingStaff}
          chambers={chambers || []}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingStaff} onOpenChange={() => setDeletingStaff(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "bn" ? "স্টাফ মুছে ফেলুন?" : "Delete Staff?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "bn"
                ? `আপনি কি নিশ্চিত যে আপনি "${deletingStaff?.full_name}" কে মুছে ফেলতে চান? এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না।`
                : `Are you sure you want to remove "${deletingStaff?.full_name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === "bn" ? "বাতিল" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingStaff}
            >
              {language === "bn" ? "মুছে ফেলুন" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
