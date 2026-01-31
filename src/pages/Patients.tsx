import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useQueue } from "@/hooks/useQueue";
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Clock,
  Phone,
  Loader2,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Patients = () => {
  const { patients, isLoading, searchPatients, deletePatient, isDeleting } = usePatients();
  const { addToQueue, isAdding: isAddingToQueue } = useQueue();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Patient | null>(null);

  const filteredPatients = searchPatients(searchQuery);

  const handleDelete = () => {
    if (deleteConfirm) {
      deletePatient(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <DashboardLayout
      title="Patients"
      description="Manage your patient records"
      actions={
        <Button asChild>
          <Link to="/dashboard/patients/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Patient
          </Link>
        </Button>
      }
    >
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Patients Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {searchQuery ? "No patients found" : "No patients yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Add your first patient to get started"}
          </p>
          {!searchQuery && (
            <Button asChild>
              <Link to="/dashboard/patients/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Patient
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Age/Gender</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link to={`/dashboard/patients/${patient.id}`} className="hover:text-primary hover:underline">
                      {patient.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`tel:${patient.phone}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      {patient.phone}
                    </a>
                  </TableCell>
                  <TableCell>
                    {patient.age && patient.gender ? (
                      `${patient.age}y / ${patient.gender.charAt(0).toUpperCase()}`
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.blood_group ? (
                      <Badge variant="outline">{patient.blood_group}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
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
                        <DropdownMenuItem
                          onClick={() => addToQueue(patient.id)}
                          disabled={isAddingToQueue}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Add to Queue
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
      )}

      {/* Delete Confirmation */}
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
    </DashboardLayout>
  );
};

export default Patients;
