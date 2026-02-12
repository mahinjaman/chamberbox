import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TimeSelect } from "@/components/ui/time-select";
import { useDoctorProfile, DoctorProfile, Chamber, AvailabilitySlot } from "@/hooks/useDoctorProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { DAYS_OF_WEEK, formatPhoneNumber, formatTime12Hour } from "@/lib/doctor-profile-utils";
import { Loader2, Plus, Trash2, MapPin, Clock, Phone, Building2, AlertTriangle, Power, DollarSign, Users, Calendar, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ProfileChambersProps {
  profile: DoctorProfile | null | undefined;
  chambers: Chamber[];
  availabilitySlots: AvailabilitySlot[];
}

export const ProfileChambers = ({ profile, chambers, availabilitySlots }: ProfileChambersProps) => {
  const { upsertChamber, deleteChamber, upsertAvailability } = useDoctorProfile();
  const { currentPlan, canAddMore } = useSubscription();
  const [editingChamber, setEditingChamber] = useState<Partial<Chamber> | null>(null);
  const [showChamberDialog, setShowChamberDialog] = useState(false);

  // Count active chambers for limit checking
  const activeChamberCount = chambers.filter(c => c.is_active).length;
  const maxChambers = currentPlan?.max_chambers || 1;
  const canActivateMore = maxChambers === -1 || activeChamberCount < maxChambers;
  const chamberLimitReached = !canActivateMore;

  const [chamberForm, setChamberForm] = useState({
    name: "",
    address: "",
    contact_number: "",
    new_patient_fee: 500,
    return_patient_fee: 300,
    is_primary: false,
    max_patients_per_session: 30,
    selectedDays: [] as number[],
    start_time: "18:00",
    end_time: "21:00",
    avg_consultation_minutes: 5,
  });

  const openNewChamber = () => {
    // Check if can add more active chambers
    if (!canActivateMore) {
      toast.error(`Your plan allows maximum ${maxChambers} active chambers.`);
      return;
    }
    setChamberForm({
      name: "",
      address: "",
      contact_number: "",
      new_patient_fee: 500,
      return_patient_fee: 300,
      is_primary: chambers.length === 0,
      max_patients_per_session: 30,
      selectedDays: [],
      start_time: "18:00",
      end_time: "21:00",
      avg_consultation_minutes: 5,
    });
    setEditingChamber(null);
    setShowChamberDialog(true);
  };

  const toggleChamberActive = async (chamber: Chamber) => {
    // If trying to activate and limit reached, show error
    if (!chamber.is_active && !canActivateMore) {
      toast.error(`Your plan allows maximum ${maxChambers} active chambers. Deactivate another chamber first.`);
      return;
    }
    
    await upsertChamber.mutateAsync({
      id: chamber.id,
      doctor_id: chamber.doctor_id,
      name: chamber.name,
      address: chamber.address,
      is_active: !chamber.is_active,
    });
    toast.success(chamber.is_active ? "Chamber deactivated" : "Chamber activated");
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
      max_patients_per_session: (chamber as any).max_patients_per_session || 30,
      selectedDays,
      start_time: startTime,
      end_time: endTime,
      avg_consultation_minutes: chamberSlots[0]?.slot_duration_minutes || 5,
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
      max_patients_per_session: chamberForm.max_patients_per_session,
    };

    await upsertChamber.mutateAsync(chamberData);

    // Save availability if chamber has ID
    if (editingChamber?.id && chamberForm.selectedDays.length > 0) {
      const slots = chamberForm.selectedDays.map(day => ({
        chamber_id: editingChamber.id!,
        day_of_week: day,
        start_time: chamberForm.start_time,
        end_time: chamberForm.end_time,
        slot_duration_minutes: chamberForm.avg_consultation_minutes,
        is_active: true,
      }));
      await upsertAvailability.mutateAsync(slots);
    }

    // Trigger auto-create sessions for the new/updated chamber
    try {
      await supabase.functions.invoke('auto-create-sessions', {
        body: { time: new Date().toISOString() }
      });
    } catch (e) {
      console.error('Failed to auto-create sessions:', e);
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
          <p className="text-muted-foreground text-sm">
            Manage your practice locations and schedules 
            {maxChambers !== -1 && (
              <span className="ml-1">({activeChamberCount}/{maxChambers} active)</span>
            )}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button 
                  onClick={openNewChamber} 
                  className="gap-2"
                  disabled={chamberLimitReached}
                >
                  <Plus className="w-4 h-4" />
                  Add Chamber
                </Button>
              </span>
            </TooltipTrigger>
            {chamberLimitReached && (
              <TooltipContent>
                <p>Your plan allows maximum {maxChambers} chambers. Upgrade to add more.</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Chamber Limit Warning */}
      {chamberLimitReached && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Active chamber limit reached ({activeChamberCount}/{maxChambers})
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Deactivate a chamber or upgrade your plan to activate more.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
              const isActive = chamber.is_active;
              
              return (
                <motion.div
                  key={chamber.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    chamber.is_primary ? "ring-2 ring-primary" : "",
                    !isActive && "opacity-60 bg-muted/50"
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                            {chamber.name}
                            {chamber.is_primary && (
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            )}
                            {!isActive && (
                              <Badge variant="secondary" className="text-xs bg-muted-foreground/20">Inactive</Badge>
                            )}
                          </CardTitle>
                          {!isActive && (
                            <p className="text-xs text-muted-foreground mt-1">
                              This chamber is hidden from public booking and profile
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Active toggle */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => toggleChamberActive(chamber)}
                                  className={cn(
                                    isActive ? "text-green-600 hover:text-green-700" : "text-muted-foreground"
                                  )}
                                >
                                  <Power className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isActive ? "Deactivate chamber" : "Activate chamber"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                        <div>
                          <span className="text-muted-foreground">Max/Session:</span>
                          <span className="font-medium ml-2">{(chamber as any).max_patients_per_session || 30}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg. Time:</span>
                          <span className="font-medium ml-2">{getChamberSlots(chamber.id)[0]?.slot_duration_minutes || 5} min</span>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">{editingChamber ? "Edit Chamber" : "Add New Chamber"}</DialogTitle>
                <DialogDescription className="text-xs">
                  Configure your chamber details and schedule
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Section: Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                <span>Basic Information</span>
              </div>
              <div className="space-y-3 pl-0.5">
                <div className="space-y-1.5">
                  <Label htmlFor="chamber-name" className="text-xs">Chamber Name *</Label>
                  <Input
                    id="chamber-name"
                    value={chamberForm.name}
                    onChange={(e) => setChamberForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., City Heart Clinic"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chamber-address" className="text-xs">Full Address *</Label>
                  <Input
                    id="chamber-address"
                    value={chamberForm.address}
                    onChange={(e) => setChamberForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="House 123, Road 5, Dhanmondi, Dhaka"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chamber-phone" className="text-xs">Contact Number</Label>
                  <Input
                    id="chamber-phone"
                    value={chamberForm.contact_number}
                    onChange={(e) => setChamberForm(prev => ({ ...prev, contact_number: e.target.value }))}
                    placeholder="01712345678"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            <div className="border-t" />

            {/* Section: Fees & Capacity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Fees & Capacity</span>
              </div>
              <div className="space-y-3 pl-0.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">New Patient Fee (৳)</Label>
                    <Input
                      type="number"
                      value={chamberForm.new_patient_fee}
                      onChange={(e) => setChamberForm(prev => ({ ...prev, new_patient_fee: Number(e.target.value) }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Follow-up Fee (৳)</Label>
                    <Input
                      type="number"
                      value={chamberForm.return_patient_fee}
                      onChange={(e) => setChamberForm(prev => ({ ...prev, return_patient_fee: Number(e.target.value) }))}
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max Patients/Session</Label>
                    <Input
                      type="number"
                      min="1"
                      max="200"
                      value={chamberForm.max_patients_per_session}
                      onChange={(e) => setChamberForm(prev => ({ ...prev, max_patients_per_session: Number(e.target.value) || 30 }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Avg. Time/Patient (min)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={chamberForm.avg_consultation_minutes}
                      onChange={(e) => setChamberForm(prev => ({ ...prev, avg_consultation_minutes: Number(e.target.value) || 5 }))}
                      className="h-9"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/70">
                  Avg. time is used to calculate estimated wait time for patients booking online.
                </p>
              </div>
            </div>

            <div className="border-t" />

            {/* Section: Schedule */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </div>
              <div className="space-y-3 pl-0.5">
                <div className="space-y-1.5">
                  <Label className="text-xs">Available Days</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map(day => (
                      <Badge
                        key={day.value}
                        variant={chamberForm.selectedDays.includes(day.value) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer text-xs px-2.5 py-1 transition-all",
                          chamberForm.selectedDays.includes(day.value) 
                            ? "shadow-sm" 
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.short}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Start Time</Label>
                    <TimeSelect
                      value={chamberForm.start_time}
                      onChange={(value) => setChamberForm(prev => ({ ...prev, start_time: value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">End Time</Label>
                    <TimeSelect
                      value={chamberForm.end_time}
                      onChange={(value) => setChamberForm(prev => ({ ...prev, end_time: value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t" />

            {/* Primary Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <Label htmlFor="is-primary" className="text-sm font-medium cursor-pointer">Set as Primary Chamber</Label>
              </div>
              <Switch
                id="is-primary"
                checked={chamberForm.is_primary}
                onCheckedChange={(checked) => setChamberForm(prev => ({ ...prev, is_primary: checked }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowChamberDialog(false)} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button 
              onClick={saveChamber} 
              disabled={upsertChamber.isPending || !chamberForm.name || !chamberForm.address}
              className="flex-1 sm:flex-none"
            >
              {upsertChamber.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Save Chamber
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
