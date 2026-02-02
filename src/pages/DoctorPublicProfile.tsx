import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePublicDoctorProfile } from "@/hooks/useDoctorProfile";
import { usePublicDoctorVideos } from "@/hooks/useDoctorVideos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DAYS_OF_WEEK, formatTime12Hour, formatCurrency, formatPhoneNumber } from "@/lib/doctor-profile-utils";
import { 
  MapPin, Clock, Phone, Star, Users, Award, Calendar, 
  ExternalLink, MessageCircle, ChevronDown, ChevronUp,
  Shield, ArrowLeft, Building2, Video, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UnifiedBookingWidget } from "@/components/public-profile/UnifiedBookingWidget";
import { ProfileEducationSection } from "@/components/public-profile/ProfileEducationSection";
import { ProfileSocialLinksSection } from "@/components/public-profile/ProfileSocialLinksSection";
import { ProfileChambersSection } from "@/components/public-profile/ProfileChambersSection";
import { ProfileVideoSection } from "@/components/public-profile/ProfileVideoSection";
import { ProfileCustomInfoSection } from "@/components/public-profile/ProfileCustomInfoSection";

// Import CustomInfoItem from the hook
import { CustomInfoItem } from "@/hooks/useDoctorProfile";

interface Education {
  id: string;
  degree: string;
  institution: string;
  year?: string;
  country?: string;
}

interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  youtube?: string;
}

const DoctorPublicProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { profile, chambers, availabilitySlots, isLoading, notFound } = usePublicDoctorProfile(slug || "");
  const { introVideo, feedVideos } = usePublicDoctorVideos(profile?.id || "");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const primaryChamber = chambers?.find(c => c.is_primary) || chambers?.[0];
  const primarySlots = primaryChamber 
    ? availabilitySlots?.filter(s => s.chamber_id === primaryChamber.id) || []
    : [];
  const activeDays = [...new Set(primarySlots.map(s => s.day_of_week))].sort();

  // Check if doctor is available today
  const today = new Date().getDay();
  const isAvailableToday = activeDays.includes(today);
  const todaySlot = primarySlots.find(s => s.day_of_week === today);

  // Parse education, social links, and custom info from profile
  const education = profile?.education as Education[] | null;
  const socialLinks = profile?.social_links as SocialLinks | null;
  const customInfo = profile?.custom_info as CustomInfoItem[] | null;

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

  const hasVideos = introVideo || feedVideos.length > 0;
  const hasMultipleChambers = chambers && chambers.length > 1;

  // Helper to get YouTube thumbnail
  const getYoutubeThumbnail = (url: string) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
      /youtube\.com\/shorts\/([^&\s?]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Shorter Cover */}
      <div className="relative">
        {/* Cover Photo */}
        <div 
          className="w-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 relative h-[180px] md:h-[240px]"
          style={profile.cover_photo_url ? {
            backgroundImage: `url(${profile.cover_photo_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          } : {}}
        >
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </div>

        {/* Centered Profile Image - Overlapping */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-background border-4 border-background shadow-2xl flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {profile.full_name?.charAt(0) || "D"}
                </span>
              )}
            </div>
            {profile.verified && (
              <div className="absolute bottom-1 right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background shadow-lg">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Content Below Cover */}
      <div className="bg-background pt-16 md:pt-20">
        {/* Expertise Badges - Below Profile Image */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 pb-3"
        >
          {profile.specialization && (
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs md:text-sm font-medium">
              {profile.specialization}
            </span>
          )}
          {profile.degrees && profile.degrees.length > 0 && (
            <span className="px-3 py-1 bg-primary/80 text-primary-foreground rounded text-xs md:text-sm font-medium">
              {profile.degrees.join(", ")}
            </span>
          )}
        </motion.div>

        {/* Social Links - Centered */}
        {socialLinks && Object.values(socialLinks).some(v => v) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center pb-4"
          >
            <ProfileSocialLinksSection socialLinks={socialLinks} youtubeUrl={profile.youtube_url} />
          </motion.div>
        )}

        {/* Stats Card */}
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg border overflow-hidden">
              {/* Stats Row */}
              <div className="bg-muted/20">
                <div className="grid grid-cols-3 divide-x divide-border">
                  <div className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-base md:text-lg font-bold">{profile.experience_years || 0}+</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Years Exp.</p>
                  </div>
                  <div className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-base md:text-lg font-bold">{profile.patient_count?.toLocaleString() || 0}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Patients</p>
                  </div>
                  <div className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-base md:text-lg font-bold">{profile.rating || "N/A"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Info */}
          <div className="md:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="gap-2">
                  <User className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="chambers" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Chambers {chambers && chambers.length > 1 && `(${chambers.length})`}
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-2">
                  <Video className="w-4 h-4" />
                  Videos {feedVideos.length > 0 && `(${feedVideos.length + (introVideo ? 1 : 0)})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Primary Chamber Location */}
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
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{primaryChamber.name}</h3>
                              <Badge variant="outline" className="text-xs">Primary</Badge>
                            </div>
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

                        {/* Show more chambers hint */}
                        {hasMultipleChambers && (
                          <div className="pt-3 border-t">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setActiveTab("chambers")}
                              className="w-full"
                            >
                              <Building2 className="w-4 h-4 mr-2" />
                              View all {chambers.length} chambers
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Education Section */}
                <ProfileEducationSection education={education} />

                {/* Intro Video Preview */}
                {introVideo && (
                  <ProfileVideoSection introVideo={introVideo} feedVideos={[]} />
                )}

                {/* About */}
                {profile.bio && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
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

                {/* Services */}
                {profile.services && profile.services.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
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

                {/* Custom Info Section */}
                <ProfileCustomInfoSection customInfo={customInfo} />
              </TabsContent>

              <TabsContent value="chambers">
                <ProfileChambersSection chambers={chambers} availabilitySlots={availabilitySlots} />
              </TabsContent>

              <TabsContent value="videos">
                {hasVideos ? (
                  <ProfileVideoSection introVideo={introVideo} feedVideos={feedVideos} />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No videos available yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking Widget (Desktop) */}
          <div className="hidden md:block">
            <div className="sticky top-4">
              {/* Unified Booking Widget - supports both today's queue and future dates */}
              <UnifiedBookingWidget 
                profile={profile} 
                chamber={primaryChamber || null}
              />
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
          <Button size="lg" className="flex-1" onClick={() => setShowBooking(true)}>
            Book Appointment
          </Button>
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
                <UnifiedBookingWidget 
                  profile={profile} 
                  chamber={primaryChamber || null}
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