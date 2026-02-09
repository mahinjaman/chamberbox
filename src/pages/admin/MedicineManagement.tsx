import { useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
} from "@/components/ui/dialog";
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
import { useMedicines, MedicineInsert } from "@/hooks/useMedicines";
import {
  Search,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Pill,
  Download,
} from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

export default function MedicineManagement() {
  const {
    medicines,
    isLoading,
    createMedicine,
    isCreating,
    deleteMedicine,
    deleteMedicinesBulk,
    isDeletingBulk,
    createMedicinesBulk,
    isCreatingBulk,
  } = useMedicines();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add form state
  const [newMed, setNewMed] = useState<MedicineInsert>({
    brand_name: "",
    generic_name: "",
    strength: "",
    dosage_form: "",
    manufacturer: "",
    default_dosage: "",
  });

  // Filter
  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase();
    return (
      !search ||
      m.brand_name.toLowerCase().includes(q) ||
      m.generic_name.toLowerCase().includes(q) ||
      m.strength?.toLowerCase().includes(q) ||
      m.dosage_form?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((m) => m.id)));
    }
  };

  const handleAddMedicine = async () => {
    if (!newMed.brand_name.trim() || !newMed.generic_name.trim()) {
      toast.error("Brand name and generic name are required");
      return;
    }
    await createMedicine(newMed);
    setNewMed({ brand_name: "", generic_name: "", strength: "", dosage_form: "", manufacturer: "", default_dosage: "" });
    setShowAddDialog(false);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    deleteMedicinesBulk(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  };

  const handleBulkAdd = async () => {
    const lines = bulkText.trim().split("\n").filter((l) => l.trim());
    if (lines.length === 0) {
      toast.error("No medicines to add");
      return;
    }

    const medicinesList: MedicineInsert[] = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      return {
        brand_name: parts[0] || "",
        generic_name: parts[1] || parts[0] || "",
        strength: parts[2] || undefined,
        dosage_form: parts[3] || undefined,
      };
    }).filter((m) => m.brand_name);

    if (medicinesList.length === 0) {
      toast.error("No valid medicines found");
      return;
    }

    await createMedicinesBulk(medicinesList);
    setBulkText("");
    setShowBulkAddDialog(false);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Skip header line if it looks like one
      const lines = text.split("\n");
      const firstLine = lines[0]?.toLowerCase();
      const hasHeader = firstLine?.includes("brand") || firstLine?.includes("name") || firstLine?.includes("generic");
      const dataLines = hasHeader ? lines.slice(1) : lines;
      setBulkText(dataLines.filter((l) => l.trim()).join("\n"));
      setShowBulkAddDialog(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportCsv = () => {
    const csv = ["Brand Name,Generic Name,Strength,Dosage Form,Manufacturer"];
    medicines.forEach((m) => {
      csv.push(`${m.brand_name},${m.generic_name},${m.strength || ""},${m.dosage_form || ""},${m.manufacturer || ""}`);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medicines.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Medicine Management" description="Manage the medicine database">
      <div className="space-y-4">
        {/* Actions Bar */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              className="pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeletingBulk}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete ({selectedIds.size})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
            <input
              type="file"
              accept=".csv,.txt"
              ref={fileInputRef}
              className="hidden"
              onChange={handleCsvUpload}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1" />
              Import CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowBulkAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Bulk Add
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Medicine
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {medicines.length}</span>
          {search && <span>Showing: {filtered.length}</span>}
          {selectedIds.size > 0 && <span>Selected: {selectedIds.size}</span>}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={paginated.length > 0 && selectedIds.size === paginated.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Brand Name</TableHead>
                    <TableHead>Generic Name</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No medicines found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((m) => (
                      <TableRow key={m.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(m.id)}
                            onCheckedChange={() => toggleSelect(m.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{m.brand_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{m.generic_name}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{m.strength || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{m.dosage_form || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{m.manufacturer || "—"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteMedicine(m.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Add Single Medicine Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medicine</DialogTitle>
            <DialogDescription>Add a new medicine to the database</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Brand Name *</Label>
                <Input
                  value={newMed.brand_name}
                  onChange={(e) => setNewMed({ ...newMed, brand_name: e.target.value })}
                  placeholder="e.g., Napa"
                />
              </div>
              <div className="space-y-2">
                <Label>Generic Name *</Label>
                <Input
                  value={newMed.generic_name}
                  onChange={(e) => setNewMed({ ...newMed, generic_name: e.target.value })}
                  placeholder="e.g., Paracetamol"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Strength</Label>
                <Input
                  value={newMed.strength || ""}
                  onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                  placeholder="e.g., 500mg"
                />
              </div>
              <div className="space-y-2">
                <Label>Dosage Form</Label>
                <Input
                  value={newMed.dosage_form || ""}
                  onChange={(e) => setNewMed({ ...newMed, dosage_form: e.target.value })}
                  placeholder="e.g., Tablet, Syrup"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Manufacturer</Label>
                <Input
                  value={newMed.manufacturer || ""}
                  onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
                  placeholder="e.g., Beximco"
                />
              </div>
              <div className="space-y-2">
                <Label>Default Dosage</Label>
                <Input
                  value={newMed.default_dosage || ""}
                  onChange={(e) => setNewMed({ ...newMed, default_dosage: e.target.value })}
                  placeholder="e.g., 1+0+1"
                />
              </div>
            </div>
            <Button onClick={handleAddMedicine} disabled={isCreating} className="w-full">
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Medicine
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={showBulkAddDialog} onOpenChange={setShowBulkAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Add Medicines</DialogTitle>
            <DialogDescription>
              Enter one medicine per line. Format: Brand Name, Generic Name, Strength, Form
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              className="w-full h-48 p-3 border rounded-md text-sm font-mono bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={`Napa, Paracetamol, 500mg, Tablet\nSeclo, Omeprazole, 20mg, Capsule\nFexo, Fexofenadine, 120mg, Tablet`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {bulkText.trim().split("\n").filter((l) => l.trim()).length} medicines ready to add
            </p>
            <Button onClick={handleBulkAdd} disabled={isCreatingBulk} className="w-full">
              {isCreatingBulk && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add All Medicines
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} medicines?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. These medicines will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeletingBulk && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
