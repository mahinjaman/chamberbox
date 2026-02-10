import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useVideoTutorials } from "@/hooks/useVideoTutorials";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PlayCircle,
  Loader2,
  Search,
  BookOpen,
  Users,
  Clock,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Globe,
  Plug,
  ListOrdered,
  HelpCircle,
  Bell,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const TOPIC_ICONS: Record<string, typeof BookOpen> = {
  "Getting Started": BookOpen,
  "Patient Management": Users,
  "Queue Management": Clock,
  "Prescriptions": FileText,
  "Finances": CreditCard,
  "Analytics": BarChart3,
  "Settings": Settings,
  "Public Profile": Globe,
  "Integrations": Plug,
  "Booking System": ListOrdered,
  "SMS & Notifications": Bell,
  "Staff Management": Users,
  "/dashboard": BookOpen,
  "/patients": Users,
  "/queue": Clock,
  "/prescriptions": FileText,
  "/finances": CreditCard,
  "/analytics": BarChart3,
  "/settings": Settings,
  "/profile": Globe,
  "/integrations": Plug,
};

const formatTopicLabel = (topic: string) => {
  if (!topic.startsWith("/")) return topic;
  return topic
    .replace(/^\//, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "General";
};

const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

const getYouTubeThumbnail = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
};

const getTopicIcon = (topic: string) => TOPIC_ICONS[topic] || BookOpen;
const getTopicLabel = (topic: string) => formatTopicLabel(topic);

export default function Tutorials() {
  const { tutorials, tutorialsLoading } = useVideoTutorials();
  const { language } = useLanguage();
  const [selectedTutorial, setSelectedTutorial] = useState<typeof tutorials extends (infer T)[] | undefined ? T | null : never>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const activeTutorials = tutorials?.filter(t => t.is_active) || [];

  const topics = useMemo(() => {
    return [...new Set(activeTutorials.map((t) => t.page_path))].sort();
  }, [activeTutorials]);

  const filteredTutorials = useMemo(() => {
    return activeTutorials.filter((tutorial) => {
      const matchesTopic = !selectedTopic || tutorial.page_path === selectedTopic;
      const matchesSearch =
        !searchQuery ||
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTopic && matchesSearch;
    });
  }, [activeTutorials, selectedTopic, searchQuery]);

  const groupedTutorials = useMemo(() => {
    const groups: Record<string, typeof activeTutorials> = {};
    filteredTutorials.forEach((t) => {
      if (!groups[t.page_path]) groups[t.page_path] = [];
      groups[t.page_path].push(t);
    });
    return groups;
  }, [filteredTutorials]);

  const t = {
    title: language === "bn" ? "হেল্প সেন্টার" : "Help Center",
    subtitle: language === "bn" ? "ভিডিও টিউটোরিয়াল দিয়ে ChamberBox ব্যবহার শিখুন" : "Learn how to use ChamberBox with video tutorials",
    searchPlaceholder: language === "bn" ? "টিউটোরিয়াল খুঁজুন..." : "Search tutorials...",
    allTopics: language === "bn" ? "সব টপিক" : "All Topics",
    noResults: language === "bn" ? "কোনো টিউটোরিয়াল পাওয়া যায়নি" : "No tutorials found",
    noResultsDesc: language === "bn" ? "অন্য সার্চ বা টপিক ফিল্টার চেষ্টা করুন" : "Try a different search or topic filter",
    videosCount: (n: number) => language === "bn" ? `${n}টি ভিডিও` : `${n} video${n !== 1 ? "s" : ""}`,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>

        {/* Search */}
        <div className="max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {tutorialsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : activeTutorials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <PlayCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t.noResults}</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="md:w-48 flex-shrink-0">
              <nav className="space-y-0.5">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between",
                    !selectedTopic
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span>{t.allTopics}</span>
                  <span className="text-xs tabular-nums opacity-60">{activeTutorials.length}</span>
                </button>
                {topics.map((topic) => {
                  const Icon = getTopicIcon(topic);
                  const count = activeTutorials.filter((tt) => tt.page_path === topic).length;
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                        selectedTopic === topic
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1 truncate">{getTopicLabel(topic)}</span>
                      <span className="text-xs tabular-nums opacity-60">{count}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main */}
            <main className="flex-1 min-w-0">
              {filteredTutorials.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-sm font-medium text-foreground mb-1">{t.noResults}</p>
                  <p className="text-xs text-muted-foreground">{t.noResultsDesc}</p>
                </div>
              ) : selectedTopic ? (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    {(() => {
                      const Icon = getTopicIcon(selectedTopic);
                      return <Icon className="w-4 h-4 text-primary" />;
                    })()}
                    <h2 className="text-base font-semibold text-foreground">{getTopicLabel(selectedTopic)}</h2>
                    <span className="text-xs text-muted-foreground">
                      {t.videosCount(filteredTutorials.length)}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredTutorials.map((tutorial) => (
                      <TutorialCard
                        key={tutorial.id}
                        tutorial={tutorial}
                        onClick={() => setSelectedTutorial(tutorial)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedTutorials).map(([topic, tuts]) => {
                    const Icon = getTopicIcon(topic);
                    return (
                      <section key={topic}>
                        <div className="flex items-center gap-2 mb-4">
                          <Icon className="w-4 h-4 text-primary" />
                          <h2 className="text-sm font-semibold text-foreground">{getTopicLabel(topic)}</h2>
                          <span className="text-xs text-muted-foreground">
                            {t.videosCount(tuts.length)}
                          </span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {tuts.map((tutorial) => (
                            <TutorialCard
                              key={tutorial.id}
                              tutorial={tutorial}
                              onClick={() => setSelectedTutorial(tutorial)}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* Video Dialog */}
      <Dialog open={!!selectedTutorial} onOpenChange={() => setSelectedTutorial(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle className="text-base">{selectedTutorial?.title}</DialogTitle>
            {selectedTutorial?.description && (
              <p className="text-xs text-muted-foreground mt-1">{selectedTutorial.description}</p>
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

const TutorialCard = ({
  tutorial,
  onClick,
}: {
  tutorial: { id: string; title: string; description: string | null; video_url: string; thumbnail_url: string | null };
  onClick: () => void;
}) => {
  const thumbnail = tutorial.thumbnail_url || getYouTubeThumbnail(tutorial.video_url);

  return (
    <Card
      className="cursor-pointer group border-border/40 hover:border-border hover:shadow-sm transition-all duration-200 overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={tutorial.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="w-10 h-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200">
              <PlayCircle className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">{tutorial.title}</h3>
          {tutorial.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {tutorial.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
