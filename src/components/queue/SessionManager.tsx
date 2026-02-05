import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QueueSession, CreateSessionInput } from "@/hooks/useQueueSessions";
import { useProfile } from "@/hooks/useProfile";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { formatTime12Hour, DAYS_OF_WEEK } from "@/lib/doctor-profile-utils";
import { format } from "date-fns";
import { 
  Plus, Clock, MapPin, Users, Play, Pause, Square, 
  Loader2, Trash2, CalendarClock, ChevronRight, LockOpen, Lock, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SessionManagerProps {
  sessions: QueueSession[];
  selectedSession: QueueSession | null;
  onSelectSession: (session: QueueSession) => void;
  onCreateSession: (input: CreateSessionInput) => void;
  onUpdateStatus: (id: string, status: QueueSession["status"]) => void;
  onToggleBooking: (id: string, booking_open: boolean) => void;
  onDeleteSession: (id: string) => void;
  onUpdateMaxPatients?: (id: string, max_patients: number) => void;
  isCreating: boolean;
  sessionDate: string;
}

export const SessionManager = ({
  sessions,
  selectedSession,
  onSelectSession,
  onCreateSession,
  onUpdateStatus,
  onToggleBooking,
  onDeleteSession,
  onUpdateMaxPatients,
  isCreating,
  sessionDate,
}: SessionManagerProps) => {
  const { profile } = useProfile();
  const { chambers, availabilitySlots } = useDoctorProfile();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [selectedChamberId, setSelectedChamberId] = useState("");
  const [customStartTime, setCustomStartTime] = useState("09:00");
  const [customEndTime, setCustomEndTime] = useState("14:00");
  const [maxPatients, setMaxPatients] = useState("30");
  const [avgConsultationMinutes, setAvgConsultationMinutes] = useState("5");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editMaxPatients, setEditMaxPatients] = useState("30");

  // Get day of week for the session date
  const dateObj = new Date(sessionDate);
  const dayOfWeek = dateObj.getDay();

  // Filter only active chambers for session creation
  const activeChambers = chambers?.filter(c => c.is_active !== false) || [];

  // Get schedule slots for the selected chamber and day (only for active chambers)
  const getScheduleSlots = (chamberId: string) => {
    const chamber = activeChambers.find(c => c.id === chamberId);
    if (!chamber) return [];
    return availabilitySlots?.filter(
      s => s.chamber_id === chamberId && s.day_of_week === dayOfWeek
    ) || [];
  };

  const handleCreateFromSchedule = (chamberId: string, slot: { start_time: string; end_time: string }) => {
    onCreateSession({
      chamber_id: chamberId,
      session_date: sessionDate,
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
      max_patients: parseInt(maxPatients),
      avg_consultation_minutes: parseInt(avgConsultationMinutes),
      is_custom: false,
    });
    setIsCreateDialogOpen(false);
  };

  const handleCreateCustomSession = () => {
    if (!selectedChamberId) return;
    
    onCreateSession({
      chamber_id: selectedChamberId,
      session_date: sessionDate,
      start_time: customStartTime,
      end_time: customEndTime,
      max_patients: parseInt(maxPatients),
      avg_consultation_minutes: parseInt(avgConsultationMinutes),
      is_custom: true,
    });
    setIsCreateDialogOpen(false);
    setIsCustomTime(false);
  };

  const handleSaveMaxPatients = (sessionId: string) => {
    if (onUpdateMaxPatients) {
      onUpdateMaxPatients(sessionId, parseInt(editMaxPatients) || 30);
    }
    setEditingSessionId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-success text-success-foreground";
      case "open": return "bg-primary text-primary-foreground";
      case "paused": return "bg-warning text-warning-foreground";
      case "closed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Play className="w-3 h-3" />;
      case "paused": return <Pause className="w-3 h-3" />;
      case "closed": return <Square className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Sessions</h3>
          <p className="text-sm text-muted-foreground">
            {format(dateObj, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Queue Session</DialogTitle>
              <DialogDescription>
                Create a session from your schedule or add custom timing.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* From Schedule */}
              {!isCustomTime && (
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">From Your Schedule</Label>
                  {activeChambers.map(chamber => {
                    const slots = getScheduleSlots(chamber.id);
                    if (slots.length === 0) return null;
                    
                    return (
                      <Card key={chamber.id} className="overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-muted/50">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{chamber.name}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          {slots.map((slot, idx) => {
                            const alreadyCreated = sessions.some(
                              s => s.chamber_id === chamber.id && 
                                   s.start_time.slice(0, 5) === slot.start_time.slice(0, 5)
                            );
                            
                            return (
                              <button
                                key={idx}
                                disabled={alreadyCreated || isCreating}
                                onClick={() => handleCreateFromSchedule(chamber.id, slot)}
                                className={cn(
                                  "w-full flex items-center justify-between p-3 border-t hover:bg-accent transition-colors",
                                  alreadyCreated && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span>
                                    {formatTime12Hour(slot.start_time.slice(0, 5))} - {formatTime12Hour(slot.end_time.slice(0, 5))}
                                  </span>
                                </div>
                                {alreadyCreated ? (
                                  <Badge variant="secondary">Created</Badge>
                                ) : isCreating ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {activeChambers.every(c => getScheduleSlots(c.id).length === 0) && (
                    <p className="text-center py-4 text-muted-foreground text-sm">
                      No schedule found for {DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label}
                    </p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsCustomTime(true)}
                  >
                    <CalendarClock className="w-4 h-4 mr-2" />
                    Add Custom Timing
                  </Button>
                </div>
              )}
              
              {/* Custom Time */}
              {isCustomTime && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Chamber</Label>
                    <Select value={selectedChamberId} onValueChange={setSelectedChamberId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select chamber" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeChambers.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input 
                        type="time" 
                        value={customStartTime}
                        onChange={e => setCustomStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input 
                        type="time" 
                        value={customEndTime}
                        onChange={e => setCustomEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Max Patients</Label>
                      <Input 
                        type="number" 
                        value={maxPatients}
                        onChange={e => setMaxPatients(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Avg Minutes/Patient</Label>
                      <Input 
                        type="number" 
                        value={avgConsultationMinutes}
                        onChange={e => setAvgConsultationMinutes(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCustomTime(false)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleCreateCustomSession}
                      disabled={!selectedChamberId || isCreating}
                      className="flex-1"
                    >
                      {isCreating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Session Cards */}
      {sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <CalendarClock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h4 className="font-medium mb-1">No sessions for today</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create a session to start managing your queue
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:overflow-visible">
          {sessions.map(session => (
            <Card 
              key={session.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md border-l-4 min-w-[260px] flex-shrink-0 lg:min-w-0",
                selectedSession?.id === session.id 
                  ? "ring-2 ring-primary border-l-primary bg-primary/5" 
                  : "border-l-transparent hover:border-l-muted-foreground/30",
                session.status === "running" && "border-l-emerald-500",
                session.status === "paused" && "border-l-amber-500",
                session.status === "closed" && "border-l-muted-foreground"
              )}
              onClick={() => onSelectSession(session)}
            >
              <CardContent className="p-3">
                {/* Top row - Time and Status */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="text-sm font-bold text-foreground">
                    {formatTime12Hour(session.start_time.slice(0, 5))}
                    <span className="text-muted-foreground font-normal mx-1">-</span>
                    {formatTime12Hour(session.end_time.slice(0, 5))}
                  </div>
                  
                  <Badge className={cn("font-medium text-[10px] h-5", getStatusColor(session.status))}>
                    {getStatusIcon(session.status)}
                    <span className="ml-1 capitalize">{session.status}</span>
                  </Badge>
                </div>
                
                {/* Chamber and patient info */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="font-medium truncate max-w-[80px]">{session.chamber?.name}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>
                      <span className="font-semibold text-foreground">{session.tokens_count || 0}</span>
                      <span>/{session.max_patients}</span>
                    </span>
                  </span>
                  {session.is_custom && (
                    <Badge variant="outline" className="text-[9px] h-4 px-1">Custom</Badge>
                  )}
                  {session.booking_open === false && (
                    <Badge 
                      variant="secondary" 
                      className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] h-4 px-1"
                    >
                      <Lock className="w-2 h-2 mr-0.5" />
                      Closed
                    </Badge>
                  )}
                </div>
                
                {/* Edit Max Patients Inline */}
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-2 mb-2" onClick={e => e.stopPropagation()}>
                    <Input
                      type="number"
                      min="1"
                      max="200"
                      value={editMaxPatients}
                      onChange={e => setEditMaxPatients(e.target.value)}
                      className="h-7 w-20 text-xs"
                    />
                    <Button 
                      size="sm" 
                      className="h-7 text-[10px] px-2"
                      onClick={() => handleSaveMaxPatients(session.id)}
                    >
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-7 text-[10px] px-2"
                      onClick={() => setEditingSessionId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : null}
                
                {/* Action buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Edit Max Patients */}
                  {session.status !== "closed" && onUpdateMaxPatients && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 text-[10px] px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditMaxPatients(String(session.max_patients));
                              setEditingSessionId(session.id);
                            }}
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit max patients ({session.max_patients})</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {/* Booking Toggle Button */}
                  {session.status !== "closed" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="sm" 
                            variant={session.booking_open !== false ? "outline" : "secondary"}
                            className={cn(
                              "h-7 text-[10px] px-2",
                              session.booking_open === false && "bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBooking(session.id, session.booking_open === false);
                            }}
                          >
                            {session.booking_open === false ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              <LockOpen className="w-3 h-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{session.booking_open === false ? "Enable public booking" : "Disable public booking"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {session.status === "open" && (
                    <Button 
                      size="sm" 
                      className="h-7 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(session.id, "running");
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  
                  {session.status === "running" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-[10px] px-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(session.id, "paused");
                        }}
                      >
                        <Pause className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-[10px] px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(session.id, "closed");
                        }}
                      >
                        <Square className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  
                  {session.status === "paused" && (
                    <Button 
                      size="sm" 
                      className="h-7 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(session.id, "running");
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Resume
                    </Button>
                  )}
                  
                  {session.status === "closed" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 text-[10px] px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(session.id, "running");
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Restart
                    </Button>
                  )}
                  
                  {(session.status === "open" || session.status === "closed") && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-7 text-[10px] px-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this session and all its tokens?")) {
                          onDeleteSession(session.id);
                        }
                      }}
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
