import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useDoctorProfile, DoctorProfile } from "@/hooks/useDoctorProfile";
import { SPECIALIZATIONS, LANGUAGES, COMMON_SERVICES } from "@/lib/doctor-profile-utils";
import { Loader2, Plus, X, Upload, User } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileBasicInfoProps {
  profile: DoctorProfile | null | undefined;
}

export const ProfileBasicInfo = ({ profile }: ProfileBasicInfoProps) => {
  const { updateProfile } = useDoctorProfile();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    bmdc_number: profile?.bmdc_number || "",
    specialization: profile?.specialization || "",
    bio: profile?.bio || "",
    experience_years: profile?.experience_years || 0,
    degrees: profile?.degrees || [],
    languages: profile?.languages || ["Bangla"],
    services: profile?.services || [],
  });

  const [newDegree, setNewDegree] = useState("");
  const [newService, setNewService] = useState("");

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  const addDegree = () => {
    if (newDegree.trim() && !formData.degrees.includes(newDegree.trim())) {
      setFormData(prev => ({
        ...prev,
        degrees: [...prev.degrees, newDegree.trim()]
      }));
      setNewDegree("");
    }
  };

  const removeDegree = (degree: string) => {
    setFormData(prev => ({
      ...prev,
      degrees: prev.degrees.filter(d => d !== degree)
    }));
  };

  const toggleLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const addService = (service: string) => {
    if (!formData.services.includes(service)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    }
    setNewService("");
  };

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Cover & Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photos</CardTitle>
          <CardDescription>Upload your cover photo and profile picture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover Photo */}
          <div className="space-y-2">
            <Label>Cover Photo (1920x400px)</Label>
            <div className="relative h-32 rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Click to upload cover photo</p>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <Button variant="outline">Upload Photo</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your professional details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
                  Dr.
                </span>
                <Input
                  id="full_name"
                  value={formData.full_name.replace(/^Dr\.?\s*/i, "")}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: `Dr. ${e.target.value}` }))}
                  className="rounded-l-none"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bmdc">BMDC Registration Number</Label>
              <Input
                id="bmdc"
                value={formData.bmdc_number}
                onChange={(e) => setFormData(prev => ({ ...prev, bmdc_number: e.target.value.toUpperCase() }))}
                placeholder="A12345"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Specialization</Label>
              <Select
                value={formData.specialization || ""}
                onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Years of Experience: {formData.experience_years}</Label>
              <Slider
                value={[formData.experience_years]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, experience_years: value }))}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          {/* Degrees */}
          <div className="space-y-2">
            <Label>Degrees & Qualifications</Label>
            <div className="flex gap-2">
              <Input
                value={newDegree}
                onChange={(e) => setNewDegree(e.target.value)}
                placeholder="e.g., MBBS, FCPS, MD"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDegree())}
              />
              <Button type="button" variant="outline" onClick={addDegree}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.degrees.map(degree => (
                <Badge key={degree} variant="secondary" className="gap-1">
                  {degree}
                  <button onClick={() => removeDegree(degree)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label>Languages Spoken</Label>
            <div className="flex flex-wrap gap-3">
              {LANGUAGES.map(lang => (
                <div key={lang} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${lang}`}
                    checked={formData.languages.includes(lang)}
                    onCheckedChange={() => toggleLanguage(lang)}
                  />
                  <label htmlFor={`lang-${lang}`} className="text-sm cursor-pointer">
                    {lang}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">About / Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Write a brief description about yourself, your experience, and your approach to patient care..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services Offered</CardTitle>
          <CardDescription>Select or add the services you provide</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMMON_SERVICES.map(service => (
              <Badge
                key={service}
                variant={formData.services.includes(service) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => 
                  formData.services.includes(service) 
                    ? removeService(service) 
                    : addService(service)
                }
              >
                {service}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Add custom service..."
              onKeyDown={(e) => e.key === "Enter" && newService.trim() && (e.preventDefault(), addService(newService.trim()))}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => newService.trim() && addService(newService.trim())}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.services.length > 0 && (
            <div className="pt-4 border-t">
              <Label className="text-sm text-muted-foreground mb-2 block">Selected Services:</Label>
              <div className="flex flex-wrap gap-2">
                {formData.services.map(service => (
                  <Badge key={service} className="gap-1">
                    {service}
                    <button onClick={() => removeService(service)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateProfile.isPending} size="lg">
          {updateProfile.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </motion.div>
  );
};
