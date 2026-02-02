import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Users, CheckCircle2, XCircle } from "lucide-react";
import { mapAuthError } from "@/lib/errors";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "@/components/common/LanguageToggle";

const StaffSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteEmail = searchParams.get("email") || "";
  
  const [email, setEmail] = useState(inviteEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingInvite, setCheckingInvite] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [staffInfo, setStaffInfo] = useState<{ full_name: string; doctor_name: string; role: string } | null>(null);
  const { language } = useLanguage();

  // Check if the email has a valid staff invitation
  useEffect(() => {
    const checkInvitation = async () => {
      const emailToCheck = email.trim().toLowerCase();
      
      if (!emailToCheck) {
        setCheckingInvite(false);
        return;
      }

      console.log("Checking invitation for email:", emailToCheck);

      const { data: staff, error } = await supabase
        .from("staff_members")
        .select(`
          full_name,
          role,
          user_id,
          doctor:profiles!staff_members_doctor_id_fkey(full_name)
        `)
        .ilike("email", emailToCheck)
        .is("user_id", null)
        .eq("is_active", true)
        .single();

      console.log("Invitation check result:", { staff, error });

      setCheckingInvite(false);

      if (error || !staff) {
        console.log("No valid invitation found:", error?.message);
        setInviteValid(false);
        return;
      }

      if (staff.user_id) {
        toast.error(language === "bn" 
          ? "এই ইমেইল ইতোমধ্যে নিবন্ধিত। লগইন করুন।"
          : "This email is already registered. Please login.");
        navigate("/staff/login");
        return;
      }

      setInviteValid(true);
      setStaffInfo({
        full_name: staff.full_name,
        doctor_name: (staff.doctor as any)?.full_name || "",
        role: staff.role,
      });
    };

    checkInvitation();
  }, [email, language, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error(language === "bn" ? "সব ফিল্ড পূরণ করুন" : "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error(language === "bn" ? "পাসওয়ার্ড মেলেনি" : "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error(language === "bn" 
        ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" 
        : "Password must be at least 6 characters");
      return;
    }

    if (!inviteValid) {
      toast.error(language === "bn" 
        ? "আপনার স্টাফ আমন্ত্রণ নেই" 
        : "You don't have a staff invitation");
      return;
    }

    setLoading(true);
    
    // Create the auth account
    const { data: authData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/staff/login`,
        data: {
          full_name: staffInfo?.full_name || "",
          is_staff: true,
        },
      },
    });

    if (error) {
      setLoading(false);
      toast.error(mapAuthError(error));
      return;
    }

    // Link the staff member to this auth account
    if (authData.user) {
      const { error: linkError } = await supabase
        .from("staff_members")
        .update({
          user_id: authData.user.id,
          accepted_at: new Date().toISOString(),
        })
        .ilike("email", email.trim());

      if (linkError) {
        console.error("Failed to link staff account:", linkError);
      }
    }

    setLoading(false);
    toast.success(language === "bn" 
      ? "অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল যাচাই করুন।" 
      : "Account created! Please verify your email.");
    navigate("/staff/login");
  };

  const roleLabels: Record<string, { en: string; bn: string }> = {
    receptionist: { en: "Receptionist", bn: "রিসেপশনিস্ট" },
    assistant: { en: "Assistant", bn: "সহকারী" },
    manager: { en: "Manager", bn: "ম্যানেজার" },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-primary/10 p-4">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle showLabel />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-secondary/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {language === "bn" ? "স্টাফ অ্যাকাউন্ট তৈরি" : "Staff Account Setup"}
          </CardTitle>
          <CardDescription>
            {language === "bn" 
              ? "আপনার স্টাফ অ্যাকাউন্ট সেটআপ করুন"
              : "Set up your staff account"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {language === "bn" ? "ইমেইল" : "Email"}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                readOnly={!!inviteEmail}
                className={inviteEmail ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>

            {/* Invitation Status */}
            {email && !checkingInvite && (
              <div className={`rounded-lg p-3 text-sm flex items-start gap-2 ${
                inviteValid 
                  ? "bg-green-50 border border-green-200 text-green-700" 
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                {inviteValid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {language === "bn" ? "আমন্ত্রণ পাওয়া গেছে!" : "Invitation found!"}
                      </p>
                      <p className="text-xs mt-1">
                        {language === "bn" 
                          ? `${staffInfo?.doctor_name} আপনাকে ${roleLabels[staffInfo?.role || ""]?.bn || staffInfo?.role} হিসেবে যুক্ত করেছেন।`
                          : `${staffInfo?.doctor_name} has invited you as ${roleLabels[staffInfo?.role || ""]?.en || staffInfo?.role}.`}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {language === "bn" ? "আমন্ত্রণ পাওয়া যায়নি" : "No invitation found"}
                      </p>
                      <p className="text-xs mt-1">
                        {language === "bn" 
                          ? "এই ইমেইলে কোনো স্টাফ আমন্ত্রণ নেই।"
                          : "No staff invitation exists for this email."}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {checkingInvite && email && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === "bn" ? "আমন্ত্রণ যাচাই করা হচ্ছে..." : "Checking invitation..."}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">
                {language === "bn" ? "পাসওয়ার্ড" : "Password"}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={!inviteValid}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {language === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"}
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={!inviteValid}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={loading || !inviteValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "bn" ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "Creating account..."}
                </>
              ) : (
                language === "bn" ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {language === "bn" ? "ইতোমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
              <Link to="/staff/login" className="text-primary hover:underline font-medium">
                {language === "bn" ? "লগইন" : "Sign In"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default StaffSignup;
