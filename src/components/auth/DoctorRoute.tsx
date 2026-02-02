import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";
import { useStaff } from "@/hooks/useStaff";
import { Loader2 } from "lucide-react";

interface DoctorRouteProps {
  children: ReactNode;
}

/**
 * Route guard that ensures:
 * 1. User is authenticated
 * 2. User is a doctor (has profile)
 * 
 * Redirects staff to /staff
 * Redirects unauthenticated users to /login
 */
export const DoctorRoute = ({ children }: DoctorRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { isStaff, staffInfoLoading } = useStaff();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!authLoading && !profileLoading && !staffInfoLoading) {
      setIsReady(true);
    }
  }, [authLoading, profileLoading, staffInfoLoading]);

  if (authLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is staff - redirect to staff dashboard
  if (isStaff && !profile) {
    return <Navigate to="/staff" replace />;
  }

  // User has no profile and is not staff - redirect to login
  if (!profile && !isStaff) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
