import { useParams, Link, useSearchParams } from "react-router-dom";
import { usePublicDoctorProfile } from "@/hooks/useDoctorProfile";
import { UnifiedBookingWidget } from "@/components/public-profile/UnifiedBookingWidget";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Stethoscope, MapPin, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DirectBooking = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";
  const { profile, chambers, isLoading } = usePublicDoctorProfile(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Doctor Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The booking link may be invalid or the doctor's profile is not available.
          </p>
          <Button asChild>
            <Link to="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  const primaryChamber = chambers?.find(c => c.is_primary) || chambers?.[0] || null;

  return (
    <div className={isEmbed ? "bg-background" : "min-h-screen bg-gradient-to-br from-background via-background to-primary/5"}>
      {/* Header - hidden in embed mode */}
      {!isEmbed && (
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">C</span>
              </div>
              <span className="text-sm font-medium">ChamberBox</span>
            </Link>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={isEmbed ? "p-4" : "max-w-2xl mx-auto px-4 py-8"}>
        {/* Doctor Card */}
        <div className="bg-card rounded-xl border p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-lg truncate">{profile.full_name}</h1>
                {profile.verified && (
                  <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-primary font-medium">{profile.specialization}</p>
              {profile.degrees && profile.degrees.length > 0 && (
                <p className="text-xs text-muted-foreground truncate">
                  {profile.degrees.join(", ")}
                </p>
              )}
              {primaryChamber && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{primaryChamber.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Widget */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-semibold">Book Your Serial</h2>
            <p className="text-sm text-muted-foreground">
              Select a date and time to book your appointment
            </p>
          </div>
          <div className="p-4">
            <UnifiedBookingWidget 
              profile={profile} 
              chamber={primaryChamber} 
            />
          </div>
        </div>

        {/* Footer - hidden in embed mode */}
        {!isEmbed && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            Powered by ChamberBox • Secure Online Booking
          </p>
        )}
      </main>
    </div>
  );
};

export default DirectBooking;
