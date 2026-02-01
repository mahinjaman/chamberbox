import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PlayCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVideoTutorials } from "@/hooks/useVideoTutorials";

export const FloatingTutorialButton = () => {
  const location = useLocation();
  const { getTutorialForPage, tutorialsLoading } = useVideoTutorials();
  const [isOpen, setIsOpen] = useState(false);
  
  const tutorial = getTutorialForPage(location.pathname);

  // Don't show if no tutorial for this page
  if (tutorialsLoading || !tutorial) {
    return null;
  }

  // Extract YouTube video ID for embed
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-50 rounded-full shadow-lg h-14 w-14 p-0"
        size="icon"
      >
        <PlayCircle className="h-7 w-7" />
      </Button>

      {/* Video Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              {tutorial.title}
            </DialogTitle>
            {tutorial.description && (
              <p className="text-sm text-muted-foreground">{tutorial.description}</p>
            )}
          </DialogHeader>
          
          <div className="aspect-video w-full">
            <iframe
              src={getYouTubeEmbedUrl(tutorial.video_url)}
              title={tutorial.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
