import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useVideoTutorials } from "@/hooks/useVideoTutorials";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const PAGE_LABELS: Record<string, { en: string; bn: string }> = {
  "/dashboard": { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  "/dashboard/patients": { en: "Patients", bn: "রোগী" },
  "/dashboard/patients/new": { en: "New Patient", bn: "নতুন রোগী" },
  "/dashboard/queue": { en: "Queue Management", bn: "কিউ ম্যানেজমেন্ট" },
  "/dashboard/prescriptions": { en: "Prescriptions", bn: "প্রেসক্রিপশন" },
  "/dashboard/finances": { en: "Finances", bn: "আর্থিক" },
  "/dashboard/analytics": { en: "Analytics", bn: "অ্যানালিটিক্স" },
  "/dashboard/settings": { en: "Settings", bn: "সেটিংস" },
  "/dashboard/profile": { en: "Public Profile", bn: "পাবলিক প্রোফাইল" },
  "/dashboard/integrations": { en: "Integrations", bn: "ইন্টিগ্রেশন" },
  "/queue-status": { en: "Queue Status", bn: "কিউ স্ট্যাটাস" },
};

const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

export default function Tutorials() {
  const { tutorials, tutorialsLoading } = useVideoTutorials();
  const { language } = useLanguage();
  const [selectedTutorial, setSelectedTutorial] = useState<typeof tutorials extends (infer T)[] | undefined ? T | null : never>(null);

  const activeTutorials = tutorials?.filter(t => t.is_active) || [];

  const getLabel = (path: string) => {
    const label = PAGE_LABELS[path];
    return label ? label[language] || label.en : path;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {language === "bn" ? "ভিডিও টিউটোরিয়াল" : "Video Tutorials"}
          </h1>
          <p className="text-muted-foreground">
            {language === "bn" ? "প্রতিটি পেজের জন্য সাহায্যকারী ভিডিও" : "Helpful videos for each page"}
          </p>
        </div>

        {tutorialsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeTutorials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <PlayCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === "bn" ? "কোনো টিউটোরিয়াল পাওয়া যায়নি" : "No tutorials available yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeTutorials.map((tutorial) => (
              <Card
                key={tutorial.id}
                className="cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => setSelectedTutorial(tutorial)}
              >
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
                    {tutorial.thumbnail_url ? (
                      <img
                        src={tutorial.thumbnail_url}
                        alt={tutorial.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PlayCircle className="w-12 h-12 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle className="w-14 h-14 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{getLabel(tutorial.page_path)}</p>
                  <h3 className="font-semibold text-sm">{tutorial.title}</h3>
                  {tutorial.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tutorial.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Dialog */}
      <Dialog open={!!selectedTutorial} onOpenChange={() => setSelectedTutorial(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              {selectedTutorial?.title}
            </DialogTitle>
            {selectedTutorial?.description && (
              <p className="text-sm text-muted-foreground">{selectedTutorial.description}</p>
            )}
          </DialogHeader>
          <div className="aspect-video w-full">
            {selectedTutorial && (
              <iframe
                src={getYouTubeEmbedUrl(selectedTutorial.video_url)}
                title={selectedTutorial.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
