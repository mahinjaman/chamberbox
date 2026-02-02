import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Stethoscope } from "lucide-react";
import { mapAuthError } from "@/lib/errors";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "@/components/common/LanguageToggle";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();

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

    // Check if user is a doctor (has profile)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", authData.user.id)
      .single();

    setLoading(false);

    if (!profile) {
      // Not a doctor - check if staff
      const { data: staffMember } = await supabase
        .from("staff_members")
        .select("id")
        .eq("user_id", authData.user.id)
        .eq("is_active", true)
        .single();

      if (staffMember) {
        toast.error(language === "bn" 
          ? "এই অ্যাকাউন্টটি স্টাফ হিসেবে নিবন্ধিত। স্টাফ লগইন ব্যবহার করুন।"
          : "This account is registered as staff. Please use the Staff Login.");
        await supabase.auth.signOut();
        navigate("/staff/login");
        return;
      }

      toast.error(language === "bn" 
        ? "এই ইমেইলে কোনো ডাক্তার অ্যাকাউন্ট নেই।"
        : "No doctor account found with this email.");
      await supabase.auth.signOut();
      return;
    }

    toast.success(language === "bn" ? "স্বাগতম!" : "Welcome back!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle showLabel />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
          <CardTitle className="text-2xl">
            {language === "bn" ? "ডাক্তার লগইন" : "Doctor Login"}
          </CardTitle>
          <CardDescription>
            {language === "bn" 
              ? "আপনার চেম্বার ম্যানেজ করতে লগইন করুন"
              : "Sign in to manage your chamber"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.emailAddress}</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.auth.password}</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  {t.auth.forgotPassword}
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
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.auth.signingIn}
                </>
              ) : (
                t.auth.signIn
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t.auth.dontHaveAccount}{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                {t.auth.signUp}
              </Link>
            </p>

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

            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/staff/login")}
            >
              {language === "bn" ? "স্টাফ লগইন" : "Staff Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default DoctorLogin;
