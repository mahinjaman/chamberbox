import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Users } from "lucide-react";
import { mapAuthError } from "@/lib/errors";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "@/components/common/LanguageToggle";

const StaffLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(language === "bn" ? "সব ফিল্ড পূরণ করুন" : "Please fill in all fields");
      return;
    }

    setLoading(true);
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      toast.error(mapAuthError(error));
      return;
    }

    // Check if this user is linked to a staff member
    const { data: staffMember, error: staffError } = await supabase
      .from("staff_members")
      .select("id, is_active, doctor:profiles!staff_members_doctor_id_fkey(full_name)")
      .eq("user_id", authData.user.id)
      .single();

    if (staffMember && staffMember.is_active) {
      setLoading(false);
      const doctorName = (staffMember.doctor as any)?.full_name || "";
      toast.success(language === "bn" 
        ? `স্বাগতম! (${doctorName})`
        : `Welcome! Working with ${doctorName}`);
      navigate("/staff");
      return;
    }

    // Check if there's a pending staff invitation for this email
    const { data: pendingStaff } = await supabase
      .from("staff_members")
      .select("id, is_active")
      .eq("email", email.trim().toLowerCase())
      .is("user_id", null)
      .single();

    if (pendingStaff) {
      // Link the account
      const { error: linkError } = await supabase
        .from("staff_members")
        .update({
          user_id: authData.user.id,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", pendingStaff.id);

      if (linkError) {
        setLoading(false);
        toast.error(language === "bn" 
          ? "অ্যাকাউন্ট লিংক করতে সমস্যা হয়েছে"
          : "Failed to link your account");
        return;
      }

      if (!pendingStaff.is_active) {
        setLoading(false);
        toast.error(language === "bn" 
          ? "আপনার অ্যাকাউন্ট নিষ্ক্রিয়। ডাক্তারের সাথে যোগাযোগ করুন।"
          : "Your account is deactivated. Please contact your doctor.");
        await supabase.auth.signOut();
        return;
      }

      setLoading(false);
      toast.success(language === "bn" 
        ? "অ্যাকাউন্ট সফলভাবে সংযুক্ত হয়েছে!"
        : "Account linked successfully!");
      navigate("/staff");
      return;
    }

    // Not a staff member - check if they're a doctor
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", authData.user.id)
      .single();

    setLoading(false);

    if (profile) {
      toast.error(language === "bn" 
        ? "এটি একটি ডাক্তার অ্যাকাউন্ট। ডাক্তার লগইন ব্যবহার করুন।"
        : "This is a doctor account. Please use Doctor Login.");
      await supabase.auth.signOut();
      navigate("/login");
      return;
    }

    toast.error(language === "bn" 
      ? "এই ইমেইলে কোনো স্টাফ অ্যাকাউন্ট নেই।"
      : "No staff account found with this email.");
    await supabase.auth.signOut();
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
            {language === "bn" ? "স্টাফ লগইন" : "Staff Login"}
          </CardTitle>
          <CardDescription>
            {language === "bn" 
              ? "আপনার ডাক্তারের চেম্বার অ্যাক্সেস করুন"
              : "Access your doctor's chamber"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
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
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  {language === "bn" ? "পাসওয়ার্ড" : "Password"}
                </Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  {language === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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

            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p>
                {language === "bn" 
                  ? "আপনার ডাক্তার আপনাকে স্টাফ হিসেবে যুক্ত করার পর পাসওয়ার্ড সেটআপের জন্য ইমেইল পাবেন।"
                  : "You'll receive a password setup email after your doctor adds you as staff."}
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "bn" ? "লগইন হচ্ছে..." : "Signing in..."}
                </>
              ) : (
                language === "bn" ? "লগইন" : "Sign In"
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {language === "bn" ? "অন্যান্য লগইন" : "Other logins"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/login")}
              >
                {language === "bn" ? "ডাক্তার" : "Doctor"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/admin/login")}
              >
                {language === "bn" ? "অ্যাডমিন" : "Admin"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default StaffLogin;
