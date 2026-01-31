import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useDoctorProfile, DoctorProfile } from "@/hooks/useDoctorProfile";
import { generateSlug } from "@/lib/doctor-profile-utils";
import { Loader2, Globe, ExternalLink, Copy, Check, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProfilePublicSettingsProps {
  profile: DoctorProfile | null | undefined;
}

export const ProfilePublicSettings = ({ profile }: ProfilePublicSettingsProps) => {
  const { updateProfile } = useDoctorProfile();
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: profile?.slug || "",
    is_public: profile?.is_public || false,
    seo_title: profile?.seo_title || "",
    seo_description: profile?.seo_description || "",
  });

  useEffect(() => {
    if (!formData.slug && profile?.full_name) {
      const suggested = generateSlug(profile.full_name, profile.specialization || undefined);
      setFormData(prev => ({ ...prev, slug: suggested }));
    }
  }, [profile?.full_name, profile?.specialization]);

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  const publicUrl = `${window.location.origin}/doctor/${formData.slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const generateNewSlug = () => {
    if (profile?.full_name) {
      const newSlug = generateSlug(profile.full_name, profile.specialization || undefined);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Public URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Public URL
          </CardTitle>
          <CardDescription>
            Customize your public profile URL for easy sharing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Custom URL Slug</Label>
            <div className="flex gap-2">
              <div className="flex flex-1">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm whitespace-nowrap">
                  /doctor/
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                  }))}
                  className="rounded-l-none"
                  placeholder="dr-your-name"
                />
              </div>
              <Button type="button" variant="outline" onClick={generateNewSlug}>
                Generate
              </Button>
            </div>
          </div>

          {formData.slug && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <Label className="text-sm text-muted-foreground">Your public profile URL:</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-background rounded border text-sm truncate">
                  {publicUrl}
                </code>
                <Button variant="outline" size="icon" onClick={copyUrl}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                {formData.is_public && (
                  <Button variant="outline" size="icon" asChild>
                    <Link to={`/doctor/${formData.slug}`} target="_blank">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visibility Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {formData.is_public ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your public profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <h4 className="font-medium">Make Profile Public</h4>
              <p className="text-sm text-muted-foreground">
                {formData.is_public 
                  ? "Your profile is visible to everyone and accepting appointments" 
                  : "Your profile is hidden from public view"}
              </p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
            />
          </div>

          {!formData.is_public && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Your profile is currently private. Patients won't be able to find or book appointments with you.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>
            Optimize how your profile appears in Google search results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-title">Page Title (for Google)</Label>
            <Input
              id="seo-title"
              value={formData.seo_title}
              onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
              placeholder={profile?.full_name ? `${profile.full_name} - ${profile.specialization || "Doctor"} in Dhaka` : "Dr. Name - Specialization in City"}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">{formData.seo_title.length}/60 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-description">Meta Description</Label>
            <Textarea
              id="seo-description"
              value={formData.seo_description}
              onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
              placeholder="Book an appointment with Dr. Name, experienced specialist in... Get quality healthcare with online appointment booking."
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{formData.seo_description.length}/160 characters</p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Google Search Preview</Label>
            <div className="p-4 bg-muted/50 rounded-lg border space-y-1">
              <p className="text-blue-600 dark:text-blue-400 text-lg truncate">
                {formData.seo_title || profile?.full_name || "Doctor Name"} | ChamberBox
              </p>
              <p className="text-green-700 dark:text-green-500 text-sm truncate">
                {publicUrl}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {formData.seo_description || `Book an appointment with ${profile?.full_name || "this doctor"}. Quality healthcare with convenient online booking.`}
              </p>
            </div>
          </div>
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
            "Save Settings"
          )}
        </Button>
      </div>
    </motion.div>
  );
};
