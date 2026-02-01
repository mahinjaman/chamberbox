import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export interface DoctorVideo {
  id: string;
  doctor_id: string;
  youtube_url: string;
  title: string | null;
  description: string | null;
  is_intro: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useDoctorVideos = (doctorId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ["doctor-videos", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const { data, error } = await supabase
        .from("doctor_videos")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("is_intro", { ascending: false })
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as DoctorVideo[];
    },
    enabled: !!doctorId,
  });

  const addVideo = useMutation({
    mutationFn: async (video: {
      doctor_id: string;
      youtube_url: string;
      title?: string;
      description?: string;
      is_intro?: boolean;
    }) => {
      // If setting as intro, unset other intros first
      if (video.is_intro) {
        await supabase
          .from("doctor_videos")
          .update({ is_intro: false })
          .eq("doctor_id", video.doctor_id);
      }

      const { error } = await supabase
        .from("doctor_videos")
        .insert([video]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-videos"] });
      toast.success("Video added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add video: " + error.message);
    },
  });

  const updateVideo = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DoctorVideo> & { id: string }) => {
      // If setting as intro, unset other intros first
      if (updates.is_intro && doctorId) {
        await supabase
          .from("doctor_videos")
          .update({ is_intro: false })
          .eq("doctor_id", doctorId);
      }

      const { error } = await supabase
        .from("doctor_videos")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-videos"] });
      toast.success("Video updated");
    },
    onError: (error) => {
      toast.error("Failed to update video: " + error.message);
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("doctor_videos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-videos"] });
      toast.success("Video deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete video: " + error.message);
    },
  });

  const introVideo = videos?.find(v => v.is_intro);
  const feedVideos = videos?.filter(v => !v.is_intro && v.is_active) || [];

  return {
    videos,
    introVideo,
    feedVideos,
    isLoading,
    addVideo,
    updateVideo,
    deleteVideo,
  };
};

// Hook for public video fetching
export const usePublicDoctorVideos = (doctorId: string) => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["public-doctor-videos", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const { data, error } = await supabase
        .from("doctor_videos")
        .select("*")
        .eq("doctor_id", doctorId)
        .eq("is_active", true)
        .order("is_intro", { ascending: false })
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as DoctorVideo[];
    },
    enabled: !!doctorId,
  });

  const introVideo = videos?.find(v => v.is_intro);
  const feedVideos = videos?.filter(v => !v.is_intro) || [];

  return {
    videos,
    introVideo,
    feedVideos,
    isLoading,
  };
};
