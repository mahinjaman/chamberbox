import { useState, useRef } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface ProfileBasicInfoProps {
  profile: DoctorProfile | null | undefined;
}

export const ProfileBasicInfo = ({ profile }: ProfileBasicInfoProps) => {
  const { updateProfile } = useDoctorProfile();
  const { user } = useAuth();
  
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, type: 'avatar' | 'cover') => {
    if (!user) {
      toast.error("Please log in to upload images");
      return;
    }

    const isAvatar = type === 'avatar';
    const setUploading = isAvatar ? setUploadingAvatar : setUploadingCover;
    const maxSize = isAvatar ? 2 : 5; // MB
    
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      const updateField = isAvatar ? 'avatar_url' : 'cover_photo_url';
      await updateProfile.mutateAsync({ [updateField]: publicUrl });
      
      toast.success(`${isAvatar ? 'Profile photo' : 'Cover photo'} updated!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, 'avatar');
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, 'cover');
  };

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
      {/* Hidden file inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverChange}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

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
            <div 
              onClick={() => !uploadingCover && coverInputRef.current?.click()}
              className="relative h-32 rounded-lg bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
            >
              {profile?.cover_photo_url ? (
                <img 
                  src={profile.cover_photo_url} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              ) : null}
              <div className={`absolute inset-0 flex items-center justify-center bg-background/60 ${profile?.cover_photo_url ? 'opacity-0 hover:opacity-100' : ''} transition-opacity`}>
                {uploadingCover ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Click to upload cover photo</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Photo"
                )}
              </Button>
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
