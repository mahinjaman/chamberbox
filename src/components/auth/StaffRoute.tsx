import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useStaff } from "@/hooks/useStaff";
import { Loader2 } from "lucide-react";

interface StaffRouteProps {
  children: ReactNode;
}

/**
 * Route guard that ensures:
 * 1. User is authenticated
 * 2. User is a staff member (has staffInfo)
 * 
 * Redirects doctors to /dashboard
 * Redirects unauthenticated users to /staff/login
 */
export const StaffRoute = ({ children }: StaffRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { staffInfo, staffInfoLoading, isStaff } = useStaff();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!authLoading && !staffInfoLoading) {
      setIsReady(true);
    }
  }, [authLoading, staffInfoLoading]);

  if (authLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  // User is logged in but not a staff member - redirect to doctor dashboard
  if (!isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
