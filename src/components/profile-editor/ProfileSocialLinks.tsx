import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDoctorProfile, DoctorProfile } from "@/hooks/useDoctorProfile";
import { Facebook, Twitter, Linkedin, Instagram, Globe, Loader2, Youtube } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileSocialLinksProps {
  profile: DoctorProfile | null | undefined;
}

interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  youtube?: string;
}

const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/yourprofile" },
  { key: "twitter", label: "X (Twitter)", icon: Twitter, placeholder: "https://x.com/yourhandle" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/yourprofile" },
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourhandle" },
  { key: "youtube", label: "YouTube Channel", icon: Youtube, placeholder: "https://youtube.com/@yourchannel" },
  { key: "website", label: "Personal Website", icon: Globe, placeholder: "https://yourwebsite.com" },
];

export const ProfileSocialLinks = ({ profile }: ProfileSocialLinksProps) => {
  const { updateProfile } = useDoctorProfile();
  
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() => {
    const links = profile?.social_links;
    if (links && typeof links === 'object' && !Array.isArray(links)) {
      return links as SocialLinks;
    }
    return {};
  });
  
  const [youtubeUrl, setYoutubeUrl] = useState(profile?.youtube_url || "");

  useEffect(() => {
    const links = profile?.social_links;
    if (links && typeof links === 'object' && !Array.isArray(links)) {
      setSocialLinks(links as SocialLinks);
    }
    setYoutubeUrl(profile?.youtube_url || "");
  }, [profile]);

  const handleSocialChange = (key: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateProfile.mutate({
      social_links: socialLinks,
      youtube_url: youtubeUrl || null,
    });
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      /youtube\.com\/shorts\/([^&\s]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    return null;
  };

  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Social Media Links
          </CardTitle>
          <CardDescription>
            Connect your social media profiles to your public page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </Label>
              <Input
                id={key}
                type="url"
                value={socialLinks[key as keyof SocialLinks] || ""}
                onChange={(e) => handleSocialChange(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* YouTube Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-destructive" />
            Introduction Video
          </CardTitle>
          <CardDescription>
            Add a YouTube video to introduce yourself to patients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube Video URL</Label>
            <Input
              id="youtube"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground">
              Supports youtube.com/watch, youtu.be, and YouTube Shorts links
            </p>
          </div>

          {/* Preview */}
          {embedUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                <iframe
                  src={embedUrl}
                  title="YouTube video preview"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
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
