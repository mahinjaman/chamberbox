import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { mapAuthError } from "@/lib/errors";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "@/components/common/LanguageToggle";

const AdminLogin = () => {
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

    // Check if user has admin role using the has_role function
    const { data: isAdmin } = await supabase
      .rpc("has_role", { _user_id: authData.user.id, _role: "admin" });

    const { data: isSuperAdmin } = await supabase
      .rpc("has_role", { _user_id: authData.user.id, _role: "super_admin" });

    setLoading(false);

    if (isAdmin || isSuperAdmin) {
      toast.success(language === "bn" ? "অ্যাডমিন প্যানেলে স্বাগতম!" : "Welcome to Admin Panel!");
      navigate("/admin");
      return;
    }

    // Not an admin
    toast.error(language === "bn" 
      ? "এই অ্যাকাউন্টে অ্যাডমিন অ্যাক্সেস নেই।"
      : "This account does not have admin access.");
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle showLabel />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl bg-slate-800/80 border-slate-700 text-white">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">
            {language === "bn" ? "অ্যাডমিন লগইন" : "Admin Login"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {language === "bn" 
              ? "ChamberBox অ্যাডমিন প্যানেল"
              : "ChamberBox Administration Panel"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                {language === "bn" ? "ইমেইল" : "Email"}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@chamberbox.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
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
                  autoComplete="current-password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-3 text-xs text-slate-400 border border-slate-600/50">
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {language === "bn" 
                  ? "এই প্যানেল শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য।"
                  : "This panel is for authorized administrators only."}
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
              size="lg" 
              disabled={loading}
            >
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
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800/80 px-2 text-slate-500">
                  {language === "bn" ? "অন্যান্য লগইন" : "Other logins"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => navigate("/login")}
              >
                {language === "bn" ? "ডাক্তার" : "Doctor"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => navigate("/staff/login")}
              >
                {language === "bn" ? "স্টাফ" : "Staff"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
