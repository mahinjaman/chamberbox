import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlayCircle,
  Loader2,
  Search,
  BookOpen,
  ArrowLeft,
  LayoutDashboard,
  Users,
  Clock,
  ListOrdered,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Globe,
  Plug,
  HelpCircle,
} from "lucide-react";
import chamberboxIcon from "@/assets/chamberbox-icon.png";

interface VideoTutorial {
  id: string;
  page_path: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
}

// Topic-based icons (page_path now stores topic names, not URL paths)
const TOPIC_ICONS: Record<string, typeof LayoutDashboard> = {
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
  "/dashboard": LayoutDashboard,
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

const helpText = {
  en: {
    title: "Help Center",
    subtitle: "Learn how to use ChamberBox with step-by-step video tutorials",
    searchPlaceholder: "Search tutorials...",
    allCategories: "All",
    noResults: "No tutorials found",
    noResultsDesc: "Try a different search or topic filter.",
    backToHome: "Back to Home",
    videosCount: (n: number) => `${n} video${n !== 1 ? "s" : ""}`,
    topics: "Topics",
  },
  bn: {
    title: "হেল্প সেন্টার",
    subtitle: "ধাপে ধাপে ভিডিও টিউটোরিয়াল দিয়ে ChamberBox ব্যবহার শিখুন",
    searchPlaceholder: "টিউটোরিয়াল খুঁজুন...",
    allCategories: "সব",
    noResults: "কোনো টিউটোরিয়াল পাওয়া যায়নি",
    noResultsDesc: "অন্য সার্চ বা টপিক ফিল্টার চেষ্টা করুন।",
    backToHome: "হোমে ফিরে যান",
    videosCount: (n: number) => `${n}টি ভিডিও`,
    topics: "টপিক",
  },
};

const HelpCenter = () => {
  const { language } = useLanguage();
  const t = helpText[language];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<VideoTutorial | null>(null);

  const { data: tutorials, isLoading } = useQuery({
    queryKey: ["publicVideoTutorials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_tutorials")
        .select("*")
        .eq("is_active", true)
        .order("page_path", { ascending: true });
      if (error) throw error;
      return data as VideoTutorial[];
    },
  });

  // Get unique categories that have tutorials
  const categories = useMemo(() => {
    if (!tutorials) return [];
    const paths = [...new Set(tutorials.map((t) => t.page_path))];
    return paths.sort();
  }, [tutorials]);

  // Filter tutorials
  const filteredTutorials = useMemo(() => {
    if (!tutorials) return [];
    return tutorials.filter((tutorial) => {
      const matchesCategory = !selectedCategory || tutorial.page_path === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [tutorials, selectedCategory, searchQuery]);

  // Group by category
  const groupedTutorials = useMemo(() => {
    const groups: Record<string, VideoTutorial[]> = {};
    filteredTutorials.forEach((t) => {
      if (!groups[t.page_path]) groups[t.page_path] = [];
      groups[t.page_path].push(t);
    });
    return groups;
  }, [filteredTutorials]);

  const getCategoryLabel = (topic: string) => formatTopicLabel(topic);

  const getCategoryIcon = (topic: string) => TOPIC_ICONS[topic] || BookOpen;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={chamberboxIcon} alt="ChamberBox" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-lg text-foreground">ChamberBox</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t.backToHome}
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">
              {language === "bn" ? "ডকুমেন্টেশন" : "Documentation"}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">{t.title}</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{t.subtitle}</p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar - Category Filter */}
            <aside className="md:w-56 flex-shrink-0">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">
                {t.topics}
              </h3>
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedCategory
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {t.allCategories}
                  <span className="ml-auto float-right text-xs opacity-60">{tutorials?.length || 0}</span>
                </button>
                {categories.map((path) => {
                  const Icon = getCategoryIcon(path);
                  const count = tutorials?.filter((t) => t.page_path === path).length || 0;
                  return (
                    <button
                      key={path}
                      onClick={() => setSelectedCategory(path)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        selectedCategory === path
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{getCategoryLabel(path)}</span>
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
              ) : selectedCategory ? (
                // Single category view
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    {(() => {
                      const Icon = getCategoryIcon(selectedCategory);
                      return <Icon className="w-5 h-5 text-primary" />;
                    })()}
                    <h2 className="text-xl font-bold text-foreground">
                      {getCategoryLabel(selectedCategory)}
                    </h2>
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
                // Grouped view
                <div className="space-y-10">
                  {Object.entries(groupedTutorials).map(([path, tuts]) => {
                    const Icon = getCategoryIcon(path);
                    return (
                      <section key={path}>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                          <Icon className="w-5 h-5 text-primary" />
                          <h2 className="text-lg font-semibold text-foreground">
                            {getCategoryLabel(path)}
                          </h2>
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

      <Footer />
    </div>
  );
};

const TutorialCard = ({
  tutorial,
  onClick,
}: {
  tutorial: VideoTutorial;
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

export default HelpCenter;
