import { Card, CardContent } from "@/components/ui/card";
import { Youtube, Play, Video } from "lucide-react";
import { motion } from "framer-motion";
import { DoctorVideo } from "@/hooks/useDoctorVideos";

interface ProfileVideoSectionProps {
  introVideo: DoctorVideo | undefined;
  feedVideos: DoctorVideo[];
}

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return null;
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

const getYoutubeThumbnail = (url: string) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
    /youtube\.com\/shorts\/([^&\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }
  return null;
};

export const ProfileVideoSection = ({ introVideo, feedVideos }: ProfileVideoSectionProps) => {
  if (!introVideo && feedVideos.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Introduction Video */}
      {introVideo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Youtube className="w-5 h-5 text-destructive" />
                Introduction
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={getYoutubeEmbedUrl(introVideo.youtube_url) || ""}
                  title={introVideo.title || "Introduction video"}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {introVideo.title && (
                <p className="mt-3 font-medium">{introVideo.title}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Video Feed */}
      {feedVideos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            More Videos ({feedVideos.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {feedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => window.open(video.youtube_url, '_blank')}
                >
                  <div className="relative aspect-video bg-muted">
                    {getYoutubeThumbnail(video.youtube_url) ? (
                      <img 
                        src={getYoutubeThumbnail(video.youtube_url)!}
                        alt={video.title || "Video thumbnail"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Youtube className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary fill-current ml-1" />
                      </div>
                    </div>
                  </div>
                  {video.title && (
                    <CardContent className="p-3">
                      <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
