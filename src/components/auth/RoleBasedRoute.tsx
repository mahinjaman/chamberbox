import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useStaff } from "@/hooks/useStaff";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("doctor" | "staff")[];
}

export const RoleBasedRoute = ({ children, allowedRoles = ["doctor"] }: RoleBasedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { staffInfo, staffInfoLoading } = useStaff();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!authLoading && !profileLoading && !staffInfoLoading) {
      setIsChecking(false);
    }
  }, [authLoading, profileLoading, staffInfoLoading]);

  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine user role
  const isDoctor = !!profile;
  const isStaff = !!staffInfo;

  // Check if user has allowed role
  const hasAllowedRole = allowedRoles.some((role) => {
    if (role === "doctor") return isDoctor;
    if (role === "staff") return isStaff;
    return false;
  });

  if (!hasAllowedRole) {
    // Redirect to appropriate dashboard based on role
    if (isStaff && !allowedRoles.includes("staff")) {
      return <Navigate to="/staff" replace />;
    }
    if (isDoctor && !allowedRoles.includes("doctor")) {
      return <Navigate to="/dashboard" replace />;
    }
    // No valid role found
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
