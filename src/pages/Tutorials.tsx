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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
  "SMS & Notifications": HelpCircle,
  "Staff Management": Users,
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

export default function Tutorials() {
  const { tutorials, tutorialsLoading } = useVideoTutorials();
  const { language } = useLanguage();
  const [selectedTutorial, setSelectedTutorial] = useState<typeof tutorials extends (infer T)[] | undefined ? T | null : never>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const activeTutorials = tutorials?.filter(t => t.is_active) || [];

  const topics = useMemo(() => {
    const paths = [...new Set(activeTutorials.map((t) => t.page_path))];
    return paths.sort();
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

  const getTopicIcon = (topic: string) => {
    return TOPIC_ICONS[topic] || HelpCircle;
  };

  const t = {
    title: language === "bn" ? "হেল্প সেন্টার" : "Help Center",
    subtitle: language === "bn" ? "ধাপে ধাপে ভিডিও টিউটোরিয়াল দিয়ে ChamberBox ব্যবহার শিখুন" : "Learn how to use ChamberBox with step-by-step video tutorials",
    searchPlaceholder: language === "bn" ? "টিউটোরিয়াল খুঁজুন..." : "Search tutorials...",
    allTopics: language === "bn" ? "সব" : "All",
    topics: language === "bn" ? "টপিক" : "Topics",
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
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Search */}
        <div className="max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {tutorialsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeTutorials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <PlayCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.noResults}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar - Topic Filter */}
            <aside className="md:w-52 flex-shrink-0">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">
                {t.topics}
              </h3>
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedTopic
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {t.allTopics}
                  <span className="ml-auto float-right text-xs opacity-60">{activeTutorials.length}</span>
                </button>
                {topics.map((topic) => {
                  const Icon = getTopicIcon(topic);
                  const count = activeTutorials.filter((tt) => tt.page_path === topic).length;
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        selectedTopic === topic
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{topic}</span>
                      <span className="text-xs opacity-60">{count}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {filteredTutorials.length === 0 ? (
                <div className="text-center py-20">
                  <PlayCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-1">{t.noResults}</h3>
                  <p className="text-sm text-muted-foreground">{t.noResultsDesc}</p>
                </div>
              ) : selectedTopic ? (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    {(() => {
                      const Icon = getTopicIcon(selectedTopic);
                      return <Icon className="w-5 h-5 text-primary" />;
                    })()}
                    <h2 className="text-xl font-bold text-foreground">{selectedTopic}</h2>
                    <span className="text-sm text-muted-foreground">
                      — {t.videosCount(filteredTutorials.length)}
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
                <div className="space-y-10">
                  {Object.entries(groupedTutorials).map(([topic, tuts]) => {
                    const Icon = getTopicIcon(topic);
                    return (
                      <section key={topic}>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                          <Icon className="w-5 h-5 text-primary" />
                          <h2 className="text-lg font-semibold text-foreground">{topic}</h2>
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
      className="cursor-pointer hover:shadow-md transition-all duration-200 group border-border/50 hover:border-primary/20"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="aspect-video bg-muted rounded-t-xl flex items-center justify-center relative overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={tutorial.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <PlayCircle className="w-12 h-12 text-muted-foreground" />
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
              <PlayCircle className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2">{tutorial.title}</h3>
          {tutorial.description && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
              {tutorial.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
