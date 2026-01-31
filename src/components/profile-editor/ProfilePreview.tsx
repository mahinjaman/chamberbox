import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoctorProfile, Chamber, AvailabilitySlot } from "@/hooks/useDoctorProfile";
import { DAYS_OF_WEEK, formatTime12Hour, formatCurrency } from "@/lib/doctor-profile-utils";
import { Monitor, Smartphone, ExternalLink, MapPin, Clock, Phone, Star, Users, Award, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ProfilePreviewProps {
  profile: DoctorProfile | null | undefined;
  chambers: Chamber[];
  availabilitySlots: AvailabilitySlot[];
}

export const ProfilePreview = ({ profile, chambers, availabilitySlots }: ProfilePreviewProps) => {
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");

  const primaryChamber = chambers.find(c => c.is_primary) || chambers[0];
  const primarySlots = primaryChamber 
    ? availabilitySlots.filter(s => s.chamber_id === primaryChamber.id) 
    : [];
  const activeDays = [...new Set(primarySlots.map(s => s.day_of_week))].sort();

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No profile data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Preview</h2>
          <p className="text-muted-foreground text-sm">See how patients will view your profile</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("desktop")}
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </div>
          {profile.is_public && profile.slug && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/doctor/${profile.slug}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Live Page
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div 
          className={`bg-background border rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
            viewMode === "mobile" 
              ? "w-[375px] max-h-[700px]" 
              : "w-full max-w-4xl"
          }`}
        >
          {/* Mock Browser Bar */}
          <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-background rounded px-3 py-1 text-xs text-muted-foreground truncate">
                chamberbox.lovable.app/doctor/{profile.slug || "your-slug"}
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="overflow-auto max-h-[600px]">
            {/* Hero Section */}
            <div className="relative">
              <div className="h-32 bg-gradient-to-r from-primary/80 to-primary/40" />
              <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-4">
                <div className="flex items-end gap-4">
                  <div className="w-24 h-24 rounded-full bg-background border-4 border-background shadow-lg flex items-center justify-center text-2xl font-bold text-primary">
                    {profile.full_name?.charAt(0) || "D"}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-16 px-4 pb-6 space-y-6">
              {/* Doctor Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{profile.full_name || "Dr. Your Name"}</h1>
                  {profile.verified && (
                    <Badge variant="default" className="bg-blue-500">
                      <Award className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                {profile.specialization && (
                  <Badge variant="secondary" className="mt-2">{profile.specialization}</Badge>
                )}
                {profile.degrees && profile.degrees.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.degrees.join(", ")}
                  </p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Clock className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold">{profile.experience_years || 0}+</p>
                  <p className="text-xs text-muted-foreground">Years Exp.</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Users className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold">{profile.patient_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Patients</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Star className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                  <p className="text-lg font-bold">{profile.rating || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Chamber Card */}
              {primaryChamber && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">{primaryChamber.name}</h3>
                        <p className="text-sm text-muted-foreground">{primaryChamber.address}</p>
                      </div>
                    </div>

                    {activeDays.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {activeDays.map(d => (
                            <Badge key={d} variant="outline" className="text-xs">
                              {DAYS_OF_WEEK.find(day => day.value === d)?.short}
                            </Badge>
                          ))}
                          {primarySlots[0] && (
                            <span className="text-sm text-muted-foreground ml-1">
                              {formatTime12Hour(primarySlots[0].start_time.slice(0, 5))} - {formatTime12Hour(primarySlots[0].end_time.slice(0, 5))}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Consultation Fee</p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(primaryChamber.new_patient_fee)}
                        </p>
                      </div>
                      <Button size="sm">Book Now</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Services */}
              {profile.services && profile.services.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.slice(0, 6).map(service => (
                      <Badge key={service} variant="outline">{service}</Badge>
                    ))}
                    {profile.services.length > 6 && (
                      <Badge variant="secondary">+{profile.services.length - 6} more</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div>
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!profile.is_public && (
        <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⚠️ This profile is currently private. Toggle visibility in the "Public URL" tab to make it live.
          </p>
        </div>
      )}
    </motion.div>
  );
};
