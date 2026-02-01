import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePublicDoctorProfile } from "@/hooks/useDoctorProfile";
import { usePublicIntegrationSettings } from "@/hooks/useIntegrationSettings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DAYS_OF_WEEK, formatTime12Hour, formatCurrency, formatPhoneNumber } from "@/lib/doctor-profile-utils";
import { 
  MapPin, Clock, Phone, Star, Users, Award, Calendar, 
  ExternalLink, MessageCircle, ChevronDown, ChevronUp,
  Shield, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BookingWidget } from "@/components/public-profile/BookingWidget";
import { CalendlyWidget } from "@/components/public-profile/CalendlyWidget";
import { QueueBookingWidget } from "@/components/public-profile/QueueBookingWidget";

const DoctorPublicProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { profile, chambers, availabilitySlots, isLoading, notFound } = usePublicDoctorProfile(slug || "");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [useBuiltInBooking, setUseBuiltInBooking] = useState(false);
  
  // Get integration settings for Calendly/WhatsApp
  const { settings: integrationSettings } = usePublicIntegrationSettings(profile?.id || "");

  const primaryChamber = chambers?.find(c => c.is_primary) || chambers?.[0];
  const primarySlots = primaryChamber 
    ? availabilitySlots?.filter(s => s.chamber_id === primaryChamber.id) || []
    : [];
  const activeDays = [...new Set(primarySlots.map(s => s.day_of_week))].sort();

  // Check if doctor is available today
  const today = new Date().getDay();
  const isAvailableToday = activeDays.includes(today);
  const todaySlot = primarySlots.find(s => s.day_of_week === today);

  // Set page title for SEO
  useEffect(() => {
    if (profile) {
      document.title = profile.seo_title || `${profile.full_name} - ${profile.specialization || "Doctor"} | ChamberBox`;
    }
  }, [profile]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Doctor Not Found</h1>
            <p className="text-muted-foreground">
              The doctor profile you're looking for doesn't exist or is not public.
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Photo */}
        <div 
          className="h-40 md:h-56 bg-gradient-to-r from-primary via-primary/80 to-primary/60"
          style={profile.cover_photo_url ? {
            backgroundImage: `url(${profile.cover_photo_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <div className="container max-w-4xl mx-auto px-4">
          <div className="relative -mt-16 md:-mt-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end gap-4"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-background border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {profile.full_name?.charAt(0) || "D"}
                    </span>
                  )}
                </div>
                {/* Online Status */}
                {isAvailableToday && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Available
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <div className="flex-1 pb-2 md:pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold">{profile.full_name}</h1>
                  {profile.verified && (
                    <Badge className="bg-blue-500 hover:bg-blue-600">
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
                    {profile.degrees.join(" | ")}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{profile.experience_years || 0}+</p>
                    <p className="text-xs text-muted-foreground">Years Experience</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{profile.patient_count?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Patients Served</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                    <p className="text-2xl font-bold">{profile.rating || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Chamber Location */}
            {primaryChamber && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{primaryChamber.name}</h3>
                        <p className="text-sm text-muted-foreground">{primaryChamber.address}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primaryChamber.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Directions
                        </a>
                      </Button>
                    </div>

                    {/* Schedule */}
                    {activeDays.length > 0 && (
                      <div className="flex items-center gap-3 pt-3 border-t">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
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
                          {primarySlots[0] && (
                            <span className="text-sm text-muted-foreground ml-2">
                              {formatTime12Hour(primarySlots[0].start_time.slice(0, 5))} - {formatTime12Hour(primarySlots[0].end_time.slice(0, 5))}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    {primaryChamber.contact_number && (
                      <div className="flex items-center gap-3 pt-3 border-t">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <a 
                          href={`tel:${primaryChamber.contact_number}`}
                          className="text-primary hover:underline"
                        >
                          {formatPhoneNumber(primaryChamber.contact_number)}
                        </a>
                        <Button variant="outline" size="sm" asChild className="ml-auto">
                          <a 
                            href={`https://wa.me/88${primaryChamber.contact_number.replace(/\D/g, "")}`}
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
            )}

            {/* Services */}
            {profile.services && profile.services.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3">Services Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.services.map(service => (
                        <Badge key={service} variant="secondary">{service}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* About */}
            {profile.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3">About</h3>
                    <p className={`text-muted-foreground ${!bioExpanded ? "line-clamp-3" : ""}`}>
                      {profile.bio}
                    </p>
                    {profile.bio.length > 200 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setBioExpanded(!bioExpanded)}
                        className="mt-2 -ml-2"
                      >
                        {bioExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Read More
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map(lang => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Booking Widgets (Desktop) */}
          <div className="hidden md:block">
            <div className="sticky top-4 space-y-4">
              {/* Queue Booking Widget - Take Serial */}
              <QueueBookingWidget 
                profile={profile} 
                chamber={primaryChamber || null}
              />
              
              {/* Calendly Widget if enabled */}
              {integrationSettings?.calendly_enabled && !useBuiltInBooking ? (
                <CalendlyWidget
                  settings={integrationSettings}
                  doctorName={profile.full_name}
                  fee={primaryChamber?.new_patient_fee}
                  onFallbackToBuiltIn={() => setUseBuiltInBooking(true)}
                />
              ) : (
                <BookingWidget 
                  profile={profile} 
                  chamber={primaryChamber || null} 
                  availabilitySlots={primarySlots}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Book Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t md:hidden z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Consultation Fee</p>
            <p className="text-xl font-bold text-primary">
              {primaryChamber ? formatCurrency(primaryChamber.new_patient_fee) : "৳0"}
            </p>
          </div>
          {integrationSettings?.calendly_enabled && !useBuiltInBooking ? (
            <Button 
              size="lg" 
              className="flex-1"
              onClick={() => window.open(integrationSettings.calendly_url!, '_blank')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book via Calendly
            </Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={() => setShowBooking(true)}>
              Book Appointment
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Booking Sheet */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setShowBooking(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-background p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Book Appointment</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowBooking(false)}>
                  Close
                </Button>
              </div>
              <div className="p-4">
                <BookingWidget 
                  profile={profile} 
                  chamber={primaryChamber || null} 
                  availabilitySlots={primarySlots}
                  onClose={() => setShowBooking(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Signals */}
      <div className="container max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Secure Booking
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Verified Doctor
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Skeleton className="h-40 md:h-56 w-full" />
    <div className="container max-w-4xl mx-auto px-4 -mt-16">
      <div className="flex items-end gap-4">
        <Skeleton className="w-28 h-28 rounded-full" />
        <div className="space-y-2 pb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <div className="hidden md:block">
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

export default DoctorPublicProfile;
