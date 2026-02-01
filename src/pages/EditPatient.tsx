import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatients } from "@/hooks/usePatients";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EditPatient = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { patients, updatePatient, isUpdating, isLoading } = usePatients();

  const patient = patients.find((p) => p.id === id);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "" as "male" | "female" | "",
    blood_group: "",
    address: "",
  });
  
  const [errors, setErrors] = useState<{ age?: string; gender?: string }>({});

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        phone: patient.phone,
        age: patient.age?.toString() || "",
        gender: patient.gender || "",
        blood_group: patient.blood_group || "",
        address: patient.address || "",
      });
    }
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    // Validate mandatory fields
    const newErrors: { age?: string; gender?: string } = {};
    if (!formData.age || parseInt(formData.age) <= 0) {
      newErrors.age = "Age is required";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});

    updatePatient(
      {
        id,
        updates: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          age: parseInt(formData.age),
          gender: formData.gender as "male" | "female",
          blood_group: formData.blood_group || null,
          address: formData.address.trim() || null,
        },
      },
      {
        onSuccess: () => {
          navigate("/dashboard/patients");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Patient">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout title="Patient Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">This patient doesn't exist or was deleted.</p>
          <Button asChild>
            <Link to="/dashboard/patients">Back to Patients</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Patient"
      description={`Update information for ${patient.name}`}
    >
      <div className="max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Update the patient's details below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Patient's full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age in years"
                    min="1"
                    max="150"
                    value={formData.age}
                    onChange={(e) => {
                      setFormData({ ...formData, age: e.target.value });
                      if (errors.age) setErrors({ ...errors, age: undefined });
                    }}
                    required
                    className={errors.age ? "border-destructive" : ""}
                  />
                  {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => {
                      setFormData({ ...formData, gender: value as "male" | "female" });
                      if (errors.gender) setErrors({ ...errors, gender: undefined });
                    }}
                  >
                    <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select
                    value={formData.blood_group}
                    onValueChange={(value) =>
                      setFormData({ ...formData, blood_group: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Patient's address (optional)"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/dashboard/patients">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditPatient;
