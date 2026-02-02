import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { useStaff } from "@/hooks/useStaff";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Search, User, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function StaffPatients() {
  const { language } = useLanguage();
  const { staffInfo, staffInfoLoading, staffPermissions } = useStaff();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState<"male" | "female" | "">("");
  const [newPatientAddress, setNewPatientAddress] = useState("");

  // Get doctor_id from staff info
  const doctorId = (staffInfo?.doctor as any)?.id;

  // Fetch patients for the doctor
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["staff_patients", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!doctorId,
  });

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      phone: string; 
      age: number; 
      gender: string;
      address?: string;
    }) => {
      if (!doctorId) throw new Error("No doctor ID");
      
      const { data: newPatient, error } = await supabase
        .from("patients")
        .insert({
          doctor_id: doctorId,
          name: data.name,
          phone: data.phone,
          age: data.age,
          gender: data.gender,
          address: data.address || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newPatient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff_patients"] });
      setIsAddDialogOpen(false);
      setNewPatientName("");
      setNewPatientPhone("");
      setNewPatientAge("");
      setNewPatientGender("");
      setNewPatientAddress("");
      toast.success(language === "bn" ? "রোগী যোগ করা হয়েছে" : "Patient added successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!staffInfoLoading && !staffPermissions?.canViewPatientList) {
      navigate("/staff");
    }
  }, [staffInfoLoading, staffPermissions, navigate]);

  if (staffInfoLoading) {
    return (
      <StaffLayout title={language === "bn" ? "রোগী" : "Patients"}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!staffPermissions?.canViewPatientList) {
    return null;
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
  );

  const handleCreatePatient = () => {
    if (!newPatientName || !newPatientPhone || !newPatientAge || !newPatientGender) {
      toast.error(language === "bn" ? "সব তথ্য পূরণ করুন" : "Fill all required fields");
      return;
    }
    createPatientMutation.mutate({
      name: newPatientName,
      phone: newPatientPhone,
      age: parseInt(newPatientAge),
      gender: newPatientGender,
      address: newPatientAddress,
    });
  };

  return (
    <StaffLayout 
      title={language === "bn" ? "রোগী" : "Patients"}
      description={language === "bn" 
        ? `মোট ${patients.length} জন রোগী` 
        : `Total ${patients.length} patients`}
      actions={
        staffPermissions?.canAddPatients && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                {language === "bn" ? "নতুন রোগী" : "New Patient"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{language === "bn" ? "নতুন রোগী যোগ করুন" : "Add New Patient"}</DialogTitle>
                <DialogDescription>
                  {language === "bn" 
                    ? "রোগীর তথ্য পূরণ করুন" 
                    : "Fill in patient details"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === "bn" ? "নাম *" : "Name *"}</Label>
                    <Input
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder={language === "bn" ? "রোগীর নাম" : "Patient name"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "bn" ? "ফোন *" : "Phone *"}</Label>
                    <Input
                      value={newPatientPhone}
                      onChange={(e) => setNewPatientPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "bn" ? "বয়স *" : "Age *"}</Label>
                    <Input
                      type="number"
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(e.target.value)}
                      placeholder={language === "bn" ? "বছর" : "Years"}
                      min="1"
                      max="150"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "bn" ? "লিঙ্গ *" : "Gender *"}</Label>
                    <Select value={newPatientGender} onValueChange={(v) => setNewPatientGender(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "bn" ? "নির্বাচন করুন" : "Select"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{language === "bn" ? "পুরুষ" : "Male"}</SelectItem>
                        <SelectItem value="female">{language === "bn" ? "মহিলা" : "Female"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{language === "bn" ? "ঠিকানা" : "Address"}</Label>
                    <Input
                      value={newPatientAddress}
                      onChange={(e) => setNewPatientAddress(e.target.value)}
                      placeholder={language === "bn" ? "ঠিকানা (ঐচ্ছিক)" : "Address (optional)"}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {language === "bn" ? "বাতিল" : "Cancel"}
                </Button>
                <Button 
                  onClick={handleCreatePatient}
                  disabled={createPatientMutation.isPending}
                >
                  {createPatientMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <UserPlus className="w-4 h-4 mr-1" />
                  {language === "bn" ? "যোগ করুন" : "Add Patient"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )
      }
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === "bn" ? "নাম বা ফোন দিয়ে খুঁজুন..." : "Search by name or phone..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patients List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery 
                  ? (language === "bn" ? "কোনো রোগী পাওয়া যায়নি" : "No patients found")
                  : (language === "bn" ? "কোনো রোগী নেই" : "No patients yet")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <Card 
                key={patient.id} 
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/staff/patients/${patient.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {patient.age && (
                        <p>{patient.age} {language === "bn" ? "বছর" : "years"}</p>
                      )}
                      {patient.gender && (
                        <p className="capitalize">{patient.gender}</p>
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
