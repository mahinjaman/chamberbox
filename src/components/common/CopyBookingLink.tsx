import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Copy, Check, ExternalLink, QrCode, Share2, Code2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyBookingLinkProps {
  slug: string;
  variant?: "default" | "compact" | "icon";
  className?: string;
}

export const CopyBookingLink = ({ slug, variant = "default", className }: CopyBookingLinkProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const baseUrl = window.location.origin;
  const bookingUrl = `${baseUrl}/book/${slug}`;
  const profileUrl = `${baseUrl}/doctor/${slug}`;

  const handleCopy = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(`${type} link copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Book Appointment",
          text: "Book your appointment online",
          url: bookingUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy(bookingUrl, "Booking");
    }
  };

  if (variant === "icon") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className={className}>
            <Link2 className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <BookingLinkContent 
            bookingUrl={bookingUrl} 
            profileUrl={profileUrl}
            copied={copied}
            onCopy={handleCopy}
            onShare={handleShare}
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === "compact") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm" className={cn("gap-2", className)}>
            <Link2 className="w-4 h-4" />
            Booking Link
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <BookingLinkContent 
            bookingUrl={bookingUrl} 
            profileUrl={profileUrl}
            copied={copied}
            onCopy={handleCopy}
            onShare={handleShare}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Link2 className="w-4 h-4" />
          Get Booking Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <BookingLinkContent 
          bookingUrl={bookingUrl} 
          profileUrl={profileUrl}
          copied={copied}
          onCopy={handleCopy}
          onShare={handleShare}
        />
      </DialogContent>
    </Dialog>
  );
};

interface BookingLinkContentProps {
  bookingUrl: string;
  profileUrl: string;
  copied: boolean;
  onCopy: (url: string, type: string) => void;
  onShare: () => void;
}

const BookingLinkContent = ({ 
  bookingUrl, 
  profileUrl, 
  copied, 
  onCopy, 
  onShare 
}: BookingLinkContentProps) => {
  const embedUrl = `${bookingUrl}?embed=true`;
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="700" frameborder="0" style="border:none; border-radius:12px; max-width:600px;"></iframe>`;
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      toast.success("Embed code copied!");
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch {
      toast.error("Failed to copy embed code");
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Share Booking Link
        </DialogTitle>
        <DialogDescription>
          Share this link with patients to let them book appointments directly online.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Direct Booking Link */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Direct Booking Link</Label>
          <div className="flex gap-2">
            <Input 
              value={bookingUrl} 
              readOnly 
              className="font-mono text-sm bg-muted"
            />
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => onCopy(bookingUrl, "Booking")}
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Opens directly to the booking form
          </p>
        </div>

        {/* Profile Link */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Full Profile Link</Label>
          <div className="flex gap-2">
            <Input 
              value={profileUrl} 
              readOnly 
              className="font-mono text-sm bg-muted"
            />
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => onCopy(profileUrl, "Profile")}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Opens your public profile with all details
          </p>
        </div>

        {/* Embed Code Section */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowEmbed(!showEmbed)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Code2 className="w-4 h-4" />
            {showEmbed ? "Hide" : "Show"} Embed Code
          </button>
          {showEmbed && (
            <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2">
              <Textarea
                value={embedCode}
                readOnly
                rows={3}
                className="font-mono text-xs bg-muted resize-none"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleCopyEmbed}
                >
                  {copiedEmbed ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy Embed Code
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste this code on any website to embed the booking form
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="default" 
            className="flex-1 gap-2"
            onClick={() => onCopy(bookingUrl, "Booking")}
          >
            <Copy className="w-4 h-4" />
            Copy Booking Link
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onShare}
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => window.open(bookingUrl, "_blank")}
            title="Preview"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
