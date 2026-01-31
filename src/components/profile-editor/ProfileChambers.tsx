import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useDoctorProfile, DoctorProfile, Chamber, AvailabilitySlot } from "@/hooks/useDoctorProfile";
import { DAYS_OF_WEEK, formatPhoneNumber, formatTime12Hour } from "@/lib/doctor-profile-utils";
import { Loader2, Plus, Trash2, MapPin, Clock, Phone, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ProfileChambersProps {
  profile: DoctorProfile | null | undefined;
  chambers: Chamber[];
  availabilitySlots: AvailabilitySlot[];
}

export const ProfileChambers = ({ profile, chambers, availabilitySlots }: ProfileChambersProps) => {
  const { upsertChamber, deleteChamber, upsertAvailability } = useDoctorProfile();
  const [editingChamber, setEditingChamber] = useState<Partial<Chamber> | null>(null);
  const [showChamberDialog, setShowChamberDialog] = useState(false);

  const [chamberForm, setChamberForm] = useState({
    name: "",
    address: "",
    contact_number: "",
    new_patient_fee: 500,
    return_patient_fee: 300,
    is_primary: false,
    selectedDays: [] as number[],
    start_time: "18:00",
    end_time: "21:00",
  });

  const openNewChamber = () => {
    setChamberForm({
      name: "",
      address: "",
      contact_number: "",
      new_patient_fee: 500,
      return_patient_fee: 300,
      is_primary: chambers.length === 0,
      selectedDays: [],
      start_time: "18:00",
      end_time: "21:00",
    });
    setEditingChamber(null);
    setShowChamberDialog(true);
  };

  const openEditChamber = (chamber: Chamber) => {
    const chamberSlots = availabilitySlots.filter(s => s.chamber_id === chamber.id);
    const selectedDays = [...new Set(chamberSlots.map(s => s.day_of_week))];
    const startTime = chamberSlots[0]?.start_time?.slice(0, 5) || "18:00";
    const endTime = chamberSlots[0]?.end_time?.slice(0, 5) || "21:00";

    setChamberForm({
      name: chamber.name,
      address: chamber.address,
      contact_number: chamber.contact_number || "",
      new_patient_fee: chamber.new_patient_fee,
      return_patient_fee: chamber.return_patient_fee,
      is_primary: chamber.is_primary,
      selectedDays,
      start_time: startTime,
      end_time: endTime,
    });
    setEditingChamber(chamber);
    setShowChamberDialog(true);
  };

  const saveChamber = async () => {
    if (!profile) return;

    const chamberData = {
      ...(editingChamber?.id ? { id: editingChamber.id } : {}),
      doctor_id: profile.id,
      name: chamberForm.name,
      address: chamberForm.address,
      contact_number: chamberForm.contact_number || null,
      new_patient_fee: chamberForm.new_patient_fee,
      return_patient_fee: chamberForm.return_patient_fee,
      is_primary: chamberForm.is_primary,
    };

    await upsertChamber.mutateAsync(chamberData);

    // Save availability if chamber has ID
    if (editingChamber?.id && chamberForm.selectedDays.length > 0) {
      const slots = chamberForm.selectedDays.map(day => ({
        chamber_id: editingChamber.id!,
        day_of_week: day,
        start_time: chamberForm.start_time,
        end_time: chamberForm.end_time,
        slot_duration_minutes: 15,
        is_active: true,
      }));
      await upsertAvailability.mutateAsync(slots);
    }

    setShowChamberDialog(false);
  };

  const toggleDay = (day: number) => {
    setChamberForm(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day].sort()
    }));
  };

  const getChamberSlots = (chamberId: string) => {
    return availabilitySlots.filter(s => s.chamber_id === chamberId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Chamber Locations</h2>
          <p className="text-muted-foreground text-sm">Manage your practice locations and schedules</p>
        </div>
        <Button onClick={openNewChamber} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Chamber
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {chambers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-1">No chambers added yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first chamber location to start accepting appointments
                </p>
                <Button onClick={openNewChamber} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Chamber
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {chambers.map((chamber, index) => {
              const slots = getChamberSlots(chamber.id);
              const days = [...new Set(slots.map(s => s.day_of_week))].sort();
              
              return (
                <motion.div
                  key={chamber.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={chamber.is_primary ? "ring-2 ring-primary" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {chamber.name}
                            {chamber.is_primary && (
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            )}
                          </CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditChamber(chamber)}>
                            <Clock className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Chamber?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this chamber and all its schedules.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteChamber.mutate(chamber.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span>{chamber.address}</span>
                      </div>
                      
                      {chamber.contact_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{formatPhoneNumber(chamber.contact_number)}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {days.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {days.map(d => (
                              <Badge key={d} variant="secondary" className="text-xs">
                                {DAYS_OF_WEEK.find(day => day.value === d)?.short}
                              </Badge>
                            ))}
                            {slots[0] && (
                              <span className="text-muted-foreground">
                                {formatTime12Hour(slots[0].start_time.slice(0, 5))} - {formatTime12Hour(slots[0].end_time.slice(0, 5))}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No schedule set</span>
                        )}
                      </div>

                      <div className="pt-2 border-t grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">New Patient:</span>
                          <span className="font-medium ml-2">৳{chamber.new_patient_fee}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Follow-up:</span>
                          <span className="font-medium ml-2">৳{chamber.return_patient_fee}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Chamber Dialog */}
      <Dialog open={showChamberDialog} onOpenChange={setShowChamberDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingChamber ? "Edit Chamber" : "Add New Chamber"}</DialogTitle>
            <DialogDescription>
              Enter your chamber details and schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chamber-name">Chamber Name</Label>
              <Input
                id="chamber-name"
                value={chamberForm.name}
                onChange={(e) => setChamberForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., City Heart Clinic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chamber-address">Full Address</Label>
              <Input
                id="chamber-address"
                value={chamberForm.address}
                onChange={(e) => setChamberForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="House 123, Road 5, Dhanmondi, Dhaka"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chamber-phone">Contact Number</Label>
              <Input
                id="chamber-phone"
                value={chamberForm.contact_number}
                onChange={(e) => setChamberForm(prev => ({ ...prev, contact_number: e.target.value }))}
                placeholder="01712345678"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Patient Fee (৳)</Label>
                <Input
                  type="number"
                  value={chamberForm.new_patient_fee}
                  onChange={(e) => setChamberForm(prev => ({ ...prev, new_patient_fee: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Follow-up Fee (৳)</Label>
                <Input
                  type="number"
                  value={chamberForm.return_patient_fee}
                  onChange={(e) => setChamberForm(prev => ({ ...prev, return_patient_fee: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <Badge
                    key={day.value}
                    variant={chamberForm.selectedDays.includes(day.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.short}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={chamberForm.start_time}
                  onChange={(e) => setChamberForm(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={chamberForm.end_time}
                  onChange={(e) => setChamberForm(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="is-primary">Set as Primary Chamber</Label>
              <Switch
                id="is-primary"
                checked={chamberForm.is_primary}
                onCheckedChange={(checked) => setChamberForm(prev => ({ ...prev, is_primary: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChamberDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveChamber} 
              disabled={upsertChamber.isPending || !chamberForm.name || !chamberForm.address}
            >
              {upsertChamber.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Chamber"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
