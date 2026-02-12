import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { usePatients, Patient } from "@/hooks/usePatients";
import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone,
  Loader2,
  Eye,
  Lock,
  Crown,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/useProfile";

const ITEMS_PER_PAGE = 15;

const Patients = () => {
  const { checkLimit, isExpired } = useFeatureAccess();
  const patientLimit = checkLimit("patients");
  const { patients, isLoading, searchPatients, deletePatient, isDeleting } = usePatients();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Patient | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Apply filters
  const filteredPatients = searchPatients(searchQuery).filter(patient => {
    if (genderFilter !== "all" && patient.gender !== genderFilter) return false;
    if (bloodGroupFilter !== "all" && patient.blood_group !== bloodGroupFilter) return false;
    return true;
  });

  // Pagination
  const totalPatients = filteredPatients.length;
  const totalPages = Math.ceil(totalPatients / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deletePatient(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  // Bulk selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedPatients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedPatients.map(p => p.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .in("id", Array.from(selectedIds));
      if (error) throw error;
      toast.success(`${selectedIds.size} patients deleted successfully`);
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["patients", profile?.id] });
    } catch (err: any) {
      toast.error("Failed to delete patients: " + err.message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const isAllSelected = paginatedPatients.length > 0 && selectedIds.size === paginatedPatients.length;
  const isSomeSelected = selectedIds.size > 0;

  return (
    <TooltipProvider>
    <DashboardLayout
      title="Patients"
      description="Manage your patient records"
      actions={
        patientLimit.withinLimit ? (
          <Button onClick={() => setIsAddOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button disabled className="opacity-60">
                <Lock className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{patientLimit.message}</p>
              <Link to="/dashboard/settings" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                <Crown className="w-3 h-3" /> Upgrade Plan
              </Link>
            </TooltipContent>
          </Tooltip>
        )
      }
    >
      {/* Search & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={genderFilter} onValueChange={(v) => handleFilterChange(setGenderFilter, v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gender</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Select value={bloodGroupFilter} onValueChange={(v) => handleFilterChange(setBloodGroupFilter, v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blood</SelectItem>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center text-sm text-muted-foreground ml-auto">
          Total: <span className="font-semibold text-foreground ml-1">{totalPatients}</span> patients
        </div>
      </div>

      {/* Bulk Action Bar */}
      {isSomeSelected && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Patients Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : totalPatients === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {searchQuery || genderFilter !== "all" || bloodGroupFilter !== "all" 
              ? "No patients found" 
              : "No patients yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || genderFilter !== "all" || bloodGroupFilter !== "all"
              ? "Try different filters"
              : "Add your first patient to get started"}
          </p>
          {!searchQuery && genderFilter === "all" && bloodGroupFilter === "all" && (
            <Button onClick={() => setIsAddOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden sm:table-cell">Age/Gender</TableHead>
                  <TableHead className="hidden md:table-cell">Blood Group</TableHead>
                  <TableHead className="hidden sm:table-cell">Registered</TableHead>
                  <TableHead className="w-[60px] sm:w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.map((patient) => (
                <TableRow key={patient.id} className={`cursor-pointer hover:bg-muted/50 ${selectedIds.has(patient.id) ? "bg-primary/5" : ""}`}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.has(patient.id)}
                      onCheckedChange={() => toggleSelect(patient.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link to={`/dashboard/patients/${patient.id}`} className="hover:text-primary hover:underline">
                      {patient.name}
                    </Link>
                    <div className="sm:hidden text-xs text-muted-foreground mt-0.5">
                      {patient.age && patient.gender ? `${patient.age}y / ${patient.gender.charAt(0).toUpperCase()}` : ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`tel:${patient.phone}`}
                      className="flex items-center gap-1 text-primary hover:underline text-sm"
                    >
                      <Phone className="w-3 h-3 shrink-0" />
                      <span className="truncate">{patient.phone}</span>
                    </a>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {patient.age && patient.gender ? (
                      `${patient.age}y / ${patient.gender.charAt(0).toUpperCase()}`
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {patient.blood_group ? (
                      <Badge variant="outline">{patient.blood_group}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {format(new Date(patient.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/patients/${patient.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/patients/${patient.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteConfirm(patient)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalPatients)} of {totalPatients}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Single Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? 
              This will also delete all their visit records and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Patients</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedIds.size}</strong> selected patients? 
              This will also delete all their visit records and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedIds.size} Patients`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
    <AddPatientDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </TooltipProvider>
  );
};

export default Patients;
