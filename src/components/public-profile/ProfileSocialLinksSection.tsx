import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Instagram, Globe, Youtube } from "lucide-react";
import { motion } from "framer-motion";

interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  youtube?: string;
}

interface ProfileSocialLinksSectionProps {
  socialLinks: SocialLinks | null;
  youtubeUrl?: string | null;
}

const SOCIAL_ICONS = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  website: Globe,
  youtube: Youtube,
};

const SOCIAL_COLORS = {
  facebook: "hover:bg-blue-600 hover:text-white hover:border-blue-600",
  twitter: "hover:bg-black hover:text-white hover:border-black",
  linkedin: "hover:bg-blue-700 hover:text-white hover:border-blue-700",
  instagram: "hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-purple-500",
  website: "hover:bg-primary hover:text-primary-foreground",
  youtube: "hover:bg-red-600 hover:text-white hover:border-red-600",
};

export const ProfileSocialLinksSection = ({ socialLinks, youtubeUrl }: ProfileSocialLinksSectionProps) => {
  // Merge youtube_url into social links for display
  const allLinks = {
    ...socialLinks,
    youtube: socialLinks?.youtube || youtubeUrl,
  };

  const activeLinks = Object.entries(allLinks).filter(([_, url]) => url);

  if (activeLinks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-2 justify-center sm:justify-start"
    >
      {activeLinks.map(([platform, url], index) => {
        const Icon = SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS];
        const colorClass = SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS];
        
        if (!Icon) return null;

        return (
          <motion.div
            key={platform}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * index }}
          >
            <Button
              variant="outline"
              size="icon"
              asChild
              className={`h-10 w-10 rounded-full transition-all duration-300 shadow-sm hover:shadow-md ${colorClass}`}
            >
              <a href={url} target="_blank" rel="noopener noreferrer" aria-label={platform}>
                <Icon className="w-5 h-5" />
              </a>
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
