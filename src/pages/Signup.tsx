import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Phone, CheckCircle, Copy, MessageCircle, Home } from "lucide-react";
import { mapAuthError } from "@/lib/errors";

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [doctorCode, setDoctorCode] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Invalid phone number. Use format: 01XXXXXXXXX");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setLoading(false);
      toast.error(mapAuthError(error));
      return;
    }

    // Fetch the doctor_code from the newly created profile
    if (data.user) {
      // Small delay for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("doctor_code")
        .eq("user_id", data.user.id)
        .single();

      if (profile?.doctor_code) {
        setDoctorCode(profile.doctor_code);
      }

      // Sign out immediately - they can't use the app until approved
      await supabase.auth.signOut();
    }

    setLoading(false);
    setSignupComplete(true);
  };

  const copyDoctorCode = () => {
    navigator.clipboard.writeText(doctorCode);
    toast.success("Doctor ID copied!");
  };

  if (signupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <Card className="w-full max-w-md relative z-10 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Account Created!</CardTitle>
            <CardDescription>
              Your account is pending admin approval
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Doctor ID Display */}
            <div className="bg-muted rounded-lg p-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Your Doctor ID</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-mono font-bold tracking-wider text-primary">
                  {doctorCode}
                </span>
                <Button variant="ghost" size="icon" onClick={copyDoctorCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Save this ID — use it to check your approval status
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-medium">Pending Approval</span>
              </div>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              An admin will review and approve your account. You'll be able to log in once approved.
            </p>

            {/* WhatsApp Support */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                const message = encodeURIComponent(
                  `Hi, I just signed up on ChamberBox. My Doctor ID is ${doctorCode}. Please approve my account.`
                );
                window.open(`https://wa.me/8801XXXXXXXXX?text=${message}`, "_blank");
              }}
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              Contact Support via WhatsApp
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="absolute top-4 left-4 z-20">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">C</span>
            </div>
          </Link>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Start your 30-day free trial
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Dr. Rahman"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  required
                  autoComplete="tel"
                  className="pl-10"
                  maxLength={11}
                />
              </div>
              <p className="text-xs text-muted-foreground">Bangladeshi format: 01XXXXXXXXX</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
