import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFeatureAccess, Feature } from "@/hooks/useFeatureAccess";
import { Lock, Crown, AlertTriangle } from "lucide-react";

interface FeatureGateProps {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export const FeatureGate = ({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true 
}: FeatureGateProps) => {
  const { checkFeatureAccess, isExpired } = useFeatureAccess();
  const access = checkFeatureAccess(feature);

  if (access.hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {isExpired ? (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Subscription Expired</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Your subscription has expired. Renew now to continue using this feature.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {access.message}
            </p>
          </>
        )}
        <Button asChild>
          <Link to="/dashboard/settings">
            <Crown className="w-4 h-4 mr-2" />
            {isExpired ? "Renew Subscription" : "Upgrade Plan"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

// Simple inline check for buttons/actions
interface FeatureButtonProps {
  feature: Feature;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export const FeatureButton = ({
  feature,
  children,
  onClick,
  className,
  variant = "default",
  size = "default",
  disabled = false,
}: FeatureButtonProps) => {
  const { checkFeatureAccess } = useFeatureAccess();
  const access = checkFeatureAccess(feature);

  if (!access.hasAccess) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
        title={access.message}
      >
        <Lock className="w-4 h-4 mr-2" />
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};
