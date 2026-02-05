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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdmin, DoctorProfile } from "@/hooks/useAdmin";
import { Search, MoreHorizontal, CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function DoctorManagement() {
  const { 
    doctors, 
    doctorsLoading, 
    approveDoctor, 
    revokeApproval,
    isApproving,
    isRevoking 
  } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const filteredDoctors = doctors?.filter((doctor) => {
    const matchesSearch = 
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.phone?.includes(searchQuery);
    
    const matchesFilter = 
      filter === "all" ||
      (filter === "pending" && !doctor.is_approved) ||
      (filter === "approved" && doctor.is_approved);

    return matchesSearch && matchesFilter;
  });

  const getSubscriptionBadge = (tier: DoctorProfile["subscription_tier"]) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      trial: "outline",
      basic: "secondary",
      pro: "default",
      premium: "default",
      enterprise: "default",
    };
    return (
      <Badge variant={variants[tier || "trial"] || "outline"}>
        {tier || "trial"}
      </Badge>
    );
  };

  return (
    <AdminLayout
      title="Doctor Management"
      description="Approve and manage doctor accounts"
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>All Doctors</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="capitalize">
                    {filter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter("all")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("approved")}>
                    Approved
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>BMDC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors?.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">
                      <Link 
                        to={`/admin/doctors/${doctor.id}`}
                        className="text-primary hover:underline"
                      >
                        {doctor.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{doctor.email}</p>
                        <p className="text-muted-foreground">{doctor.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{doctor.specialization || "-"}</TableCell>
                    <TableCell>{doctor.bmdc_number || "-"}</TableCell>
                    <TableCell>
                      {doctor.is_approved ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600/80">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getSubscriptionBadge(doctor.subscription_tier)}</TableCell>
                    <TableCell>
                      {format(new Date(doctor.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isApproving || isRevoking}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/doctors/${doctor.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {doctor.is_approved ? (
                            <DropdownMenuItem 
                              onClick={() => revokeApproval(doctor.id)}
                              className="text-destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Revoke Approval
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => approveDoctor(doctor.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Doctor
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDoctors?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No doctors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
