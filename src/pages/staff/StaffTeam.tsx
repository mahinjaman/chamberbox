import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Users, Mail, Phone, Building2, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";

const roleLabels = {
  receptionist: { en: "Receptionist", bn: "রিসেপশনিস্ট" },
  assistant: { en: "Assistant", bn: "সহকারী" },
  manager: { en: "Manager", bn: "ম্যানেজার" },
};

export default function StaffTeam() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Get doctor_id from staff info
  const doctorId = (staffInfo?.doctor as any)?.id;

  // Fetch all staff members for the doctor
  const { data: staffMembers = [], isLoading } = useQuery({
    queryKey: ["staff_team_members", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      
      const { data, error } = await supabase
        .from("staff_members")
        .select(`
          *,
          chamber_access:staff_chamber_access(
            *,
            chamber:chambers(id, name, address)
          )
        `)
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  useEffect(() => {
    if (!staffInfoLoading && !staffPermissions?.canManageStaff) {
      navigate("/staff");
    }
  }, [staffInfoLoading, staffPermissions, navigate]);

  if (staffInfoLoading) {
    return (
      <StaffLayout title={language === "bn" ? "স্টাফ টিম" : "Staff Team"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!staffPermissions?.canManageStaff) {
    return null;
  }

  const filteredStaff = staffMembers.filter(
    (member) =>
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.phone && member.phone.includes(searchQuery))
  );

  const activeCount = staffMembers.filter(m => m.is_active).length;
  const pendingCount = staffMembers.filter(m => !m.accepted_at).length;

  return (
    <StaffLayout 
      title={language === "bn" ? "স্টাফ টিম" : "Staff Team"}
      description={language === "bn" 
        ? `মোট ${staffMembers.length} জন স্টাফ` 
        : `Total ${staffMembers.length} staff members`}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{staffMembers.length}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "মোট স্টাফ" : "Total Staff"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "সক্রিয়" : "Active"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <UserX className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "আমন্ত্রিত" : "Pending Invite"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === "bn" ? "নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..." : "Search by name, email or phone..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Staff List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredStaff.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery 
                  ? (language === "bn" ? "কোনো স্টাফ পাওয়া যায়নি" : "No staff found")
                  : (language === "bn" ? "কোনো স্টাফ নেই" : "No staff members yet")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredStaff.map((member) => (
              <Card key={member.id} className={!member.is_active ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{member.full_name}</h3>
                          <Badge 
                            variant={member.role === "manager" ? "default" : "secondary"}
                          >
                            {roleLabels[member.role as keyof typeof roleLabels]?.[language] || member.role}
                          </Badge>
                          {!member.is_active && (
                            <Badge variant="destructive">
                              {language === "bn" ? "নিষ্ক্রিয়" : "Inactive"}
                            </Badge>
                          )}
                          {!member.accepted_at && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                              {language === "bn" ? "আমন্ত্রিত" : "Pending"}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Chamber Access */}
                        {member.chamber_access && member.chamber_access.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              {language === "bn" ? "চেম্বার অ্যাক্সেস:" : "Chamber Access:"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {member.chamber_access.map((access: any) => (
                                <Badge key={access.id} variant="outline" className="text-xs">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  {access.chamber?.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>
                        {language === "bn" ? "যোগ দেওয়া হয়েছে" : "Added"}
                      </p>
                      <p>{format(new Date(member.created_at), "dd MMM yyyy")}</p>
                      {member.accepted_at && (
                        <>
                          <p className="mt-2">
                            {language === "bn" ? "অ্যাক্টিভেট করা হয়েছে" : "Activated"}
                          </p>
                          <p>{format(new Date(member.accepted_at), "dd MMM yyyy")}</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
