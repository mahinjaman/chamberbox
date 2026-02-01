import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, ExternalLink, Clock, Calendar, MessageCircle, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Chamber, AvailabilitySlot } from "@/hooks/useDoctorProfile";
import { DAYS_OF_WEEK, formatTime12Hour, formatCurrency, formatPhoneNumber } from "@/lib/doctor-profile-utils";

interface ProfileChambersSectionProps {
  chambers: Chamber[] | undefined;
  availabilitySlots: AvailabilitySlot[] | undefined;
}

export const ProfileChambersSection = ({ chambers, availabilitySlots }: ProfileChambersSectionProps) => {
  if (!chambers || chambers.length === 0) return null;

  const today = new Date().getDay();

  const getChambersSlots = (chamberId: string) => {
    return availabilitySlots?.filter(s => s.chamber_id === chamberId) || [];
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary" />
        All Chambers ({chambers.length})
      </h3>
      
      <div className="grid gap-4">
        {chambers.map((chamber, index) => {
          const slots = getChambersSlots(chamber.id);
          const activeDays = [...new Set(slots.map(s => s.day_of_week))].sort();
          const isAvailableToday = activeDays.includes(today);
          const todaySlot = slots.find(s => s.day_of_week === today);

          return (
            <motion.div
              key={chamber.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={chamber.is_primary ? "border-primary/50 bg-primary/5" : ""}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{chamber.name}</h4>
                        {chamber.is_primary && (
                          <Badge variant="default" className="text-xs">Primary</Badge>
                        )}
                        {isAvailableToday && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />
                            Available Today
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{chamber.address}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chamber.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Directions
                      </a>
                    </Button>
                  </div>

                  {/* Fees */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">New Patient:</span>
                      <span className="font-semibold text-primary">{formatCurrency(chamber.new_patient_fee)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Follow-up:</span>
                      <span className="font-semibold">{formatCurrency(chamber.return_patient_fee)}</span>
                    </div>
                  </div>

                  {/* Schedule */}
                  {activeDays.length > 0 && (
                    <div className="flex items-center gap-3 pt-3 border-t">
                      <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex flex-wrap gap-2 items-center">
                        {activeDays.map(d => (
                          <Badge 
                            key={d} 
                            variant={d === today ? "default" : "outline"}
                            className={d === today ? "bg-green-500" : ""}
                          >
                            {DAYS_OF_WEEK.find(day => day.value === d)?.short}
                          </Badge>
                        ))}
                        {slots[0] && (
                          <span className="text-sm text-muted-foreground ml-2 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime12Hour(slots[0].start_time.slice(0, 5))} - {formatTime12Hour(slots[0].end_time.slice(0, 5))}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {chamber.contact_number && (
                    <div className="flex items-center gap-3 pt-3 border-t">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <a 
                        href={`tel:${chamber.contact_number}`}
                        className="text-primary hover:underline"
                      >
                        {formatPhoneNumber(chamber.contact_number)}
                      </a>
                      <Button variant="outline" size="sm" asChild className="ml-auto">
                        <a 
                          href={`https://wa.me/88${chamber.contact_number.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
