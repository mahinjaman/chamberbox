import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DoctorProfile } from "@/hooks/useDoctorProfile";
import { useDoctorVideos, DoctorVideo } from "@/hooks/useDoctorVideos";
import { Youtube, Plus, Trash2, Loader2, Star, Video, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ProfileVideosProps {
  profile: DoctorProfile | null | undefined;
}

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return null;
};

const getYoutubeThumbnail = (url: string) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }
  return null;
};

export const ProfileVideos = ({ profile }: ProfileVideosProps) => {
  const { videos, introVideo, addVideo, updateVideo, deleteVideo, isLoading } = useDoctorVideos(profile?.id);
  
  const [newVideo, setNewVideo] = useState({
    youtube_url: "",
    title: "",
    is_intro: false,
  });

  const handleAddVideo = () => {
    if (!newVideo.youtube_url.trim() || !profile?.id) return;
    
    addVideo.mutate({
      doctor_id: profile.id,
      youtube_url: newVideo.youtube_url,
      title: newVideo.title || null,
      is_intro: newVideo.is_intro,
    });
    
    setNewVideo({ youtube_url: "", title: "", is_intro: false });
  };

  const handleSetAsIntro = (video: DoctorVideo) => {
    updateVideo.mutate({ id: video.id, is_intro: true });
  };

  const handleToggleActive = (video: DoctorVideo) => {
    updateVideo.mutate({ id: video.id, is_active: !video.is_active });
  };

  const embedUrl = getYoutubeEmbedUrl(newVideo.youtube_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Add New Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-destructive" />
            Add Video
          </CardTitle>
          <CardDescription>
            Add YouTube videos to your profile. Set one as your introduction video.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL *</Label>
              <Input
                id="youtube-url"
                type="url"
                value={newVideo.youtube_url}
                onChange={(e) => setNewVideo(prev => ({ ...prev, youtube_url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-title">Title (optional)</Label>
              <Input
                id="video-title"
                value={newVideo.title}
                onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Video title"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="is-intro"
                checked={newVideo.is_intro}
                onCheckedChange={(checked) => setNewVideo(prev => ({ ...prev, is_intro: checked }))}
              />
              <Label htmlFor="is-intro" className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                Set as Introduction Video
              </Label>
            </div>
            <Button 
              onClick={handleAddVideo}
              disabled={!newVideo.youtube_url.trim() || addVideo.isPending}
            >
              {addVideo.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Video
            </Button>
          </div>

          {/* Preview */}
          {embedUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="aspect-video rounded-lg overflow-hidden border bg-muted max-w-md">
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

      {/* Video List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Your Videos ({videos?.length || 0})
          </CardTitle>
          <CardDescription>
            Manage your video collection. The intro video appears on your profile, others in the video feed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !videos?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No videos added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {videos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      video.is_intro ? "bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800" : "bg-card"
                    }`}
                  >
                    <div className="flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-muted">
                      {getYoutubeThumbnail(video.youtube_url) ? (
                        <img 
                          src={getYoutubeThumbnail(video.youtube_url)!} 
                          alt={video.title || "Video thumbnail"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Youtube className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold truncate">
                          {video.title || "Untitled Video"}
                        </h4>
                        {video.is_intro && (
                          <Badge className="bg-yellow-500">
                            <Star className="w-3 h-3 mr-1" />
                            Intro
                          </Badge>
                        )}
                        {!video.is_active && (
                          <Badge variant="outline">Hidden</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {video.youtube_url}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {!video.is_intro && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetAsIntro(video)}
                            disabled={updateVideo.isPending}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Set as Intro
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(video)}
                          disabled={updateVideo.isPending}
                        >
                          {video.is_active ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteVideo.mutate(video.id)}
                      disabled={deleteVideo.isPending}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
