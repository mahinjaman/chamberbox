import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useAdmin, DoctorProfile } from "@/hooks/useAdmin";
import { Search, MoreHorizontal, CheckCircle, XCircle, Loader2, Eye, ShieldBan, Trash2, StickyNote, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DoctorManagement() {
  const { 
    doctors, doctorsLoading, 
    approveDoctor, revokeApproval,
    bulkApprove, bulkReject, bulkMarkSpam,
    updateAdminNotes,
    isApproving, isRevoking, isBulkProcessing,
  } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [noteDialog, setNoteDialog] = useState<{ open: boolean; doctor: DoctorProfile | null }>({ open: false, doctor: null });
  const [noteText, setNoteText] = useState("");

  const filteredDoctors = doctors?.filter((doctor) => {
    const matchesSearch = 
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.phone?.includes(searchQuery) ||
      doctor.doctor_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === "all" ||
      (filter === "pending" && (doctor.approval_status === "pending" || (!doctor.approval_status && !doctor.is_approved))) ||
      (filter === "approved" && doctor.approval_status === "approved") ||
      (filter === "rejected" && (doctor.approval_status === "rejected" || doctor.approval_status === "spam"));

    return matchesSearch && matchesFilter;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (!filteredDoctors) return;
    if (selectedIds.length === filteredDoctors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDoctors.map(d => d.id));
    }
  };

  const handleBulkAction = (action: "approve" | "reject" | "spam") => {
    if (selectedIds.length === 0) { toast.error("Select doctors first"); return; }
    if (action === "approve") bulkApprove(selectedIds);
    else if (action === "reject") bulkReject(selectedIds);
    else if (action === "spam") bulkMarkSpam(selectedIds);
    setSelectedIds([]);
  };

  const openNoteDialog = (doctor: DoctorProfile) => {
    setNoteDialog({ open: true, doctor });
    setNoteText(doctor.admin_notes || "");
  };

  const saveNote = () => {
    if (noteDialog.doctor) {
      updateAdminNotes({ doctorId: noteDialog.doctor.id, notes: noteText });
      setNoteDialog({ open: false, doctor: null });
    }
  };

  const getSubscriptionBadge = (tier: DoctorProfile["subscription_tier"]) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      trial: "outline", basic: "secondary", pro: "default", premium: "default", enterprise: "default",
    };
    return <Badge variant={variants[tier || "trial"] || "outline"}>{tier || "trial"}</Badge>;
  };

  return (
    <AdminLayout title="Doctor Management" description="Approve and manage doctor accounts">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>All Doctors ({filteredDoctors?.length || 0})</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[220px]"
              />
            </div>
          </div>
          {/* Filter tabs below title */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {(["all", "pending", "approved", "rejected"] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                className="capitalize"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-muted rounded-md flex-wrap">
              <span className="text-sm font-medium">{selectedIds.length} selected</span>
              <Button size="sm" variant="default" onClick={() => handleBulkAction("approve")} disabled={isBulkProcessing}>
                <CheckCircle className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("reject")} disabled={isBulkProcessing}>
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleBulkAction("spam")} disabled={isBulkProcessing}>
                <ShieldBan className="w-3 h-3 mr-1" /> Mark Spam
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>Clear</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {doctorsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filteredDoctors?.length ? selectedIds.length === filteredDoctors.length : false}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Doctor ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>BMDC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors?.map((doctor) => (
                    <TableRow key={doctor.id} className={selectedIds.includes(doctor.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(doctor.id)}
                          onCheckedChange={() => toggleSelect(doctor.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                          {doctor.doctor_code || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link to={`/admin/doctors/${doctor.id}`} className="text-primary hover:underline">
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
                        {doctor.approval_status === "approved" ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600/80">
                            <CheckCircle className="w-3 h-3 mr-1" /> Approved
                          </Badge>
                        ) : doctor.approval_status === "spam" ? (
                          <Badge variant="destructive">
                            <ShieldBan className="w-3 h-3 mr-1" /> Spam
                          </Badge>
                        ) : doctor.approval_status === "rejected" ? (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" /> Rejected
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getSubscriptionBadge(doctor.subscription_tier)}</TableCell>
                      <TableCell>{format(new Date(doctor.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {doctor.admin_notes && doctor.admin_notes !== "Marked as spam" ? (
                          <button
                            onClick={() => openNoteDialog(doctor)}
                            className="text-xs text-muted-foreground hover:text-foreground truncate max-w-[100px] block"
                            title={doctor.admin_notes}
                          >
                            📝 {doctor.admin_notes.slice(0, 20)}...
                          </button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => openNoteDialog(doctor)}>
                            <StickyNote className="w-3 h-3 mr-1" /> Add
                          </Button>
                        )}
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
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openNoteDialog(doctor)}>
                              <StickyNote className="w-4 h-4 mr-2" /> Add/Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {doctor.is_approved ? (
                              <DropdownMenuItem onClick={() => revokeApproval(doctor.id)} className="text-destructive">
                                <XCircle className="w-4 h-4 mr-2" /> Reject / Revoke
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => approveDoctor(doctor.id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => revokeApproval(doctor.id)} className="text-destructive">
                                  <XCircle className="w-4 h-4 mr-2" /> Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => { bulkMarkSpam([doctor.id]); }}
                              className="text-destructive"
                            >
                              <ShieldBan className="w-4 h-4 mr-2" /> Mark as Spam
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDoctors?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                        No doctors found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note Dialog */}
      <Dialog open={noteDialog.open} onOpenChange={(open) => setNoteDialog({ open, doctor: open ? noteDialog.doctor : null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Note for {noteDialog.doctor?.full_name}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add admin note about this doctor..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog({ open: false, doctor: null })}>Cancel</Button>
            <Button onClick={saveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
