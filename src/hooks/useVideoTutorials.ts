import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdmin } from "./useAdmin";

export interface VideoTutorial {
  id: string;
  page_path: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useVideoTutorials = () => {
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();

  // Fetch all tutorials (admin) or active tutorials (users)
  const { data: tutorials, isLoading: tutorialsLoading } = useQuery({
    queryKey: ["videoTutorials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_tutorials")
        .select("*")
        .order("page_path", { ascending: true });

      if (error) throw error;
      return data as VideoTutorial[];
    },
  });

  // Get tutorial for specific page
  const getTutorialForPage = (pagePath: string) => {
    return tutorials?.find(t => t.page_path === pagePath && t.is_active);
  };

  // Create/Update tutorial (admin only)
  const saveTutorial = useMutation({
    mutationFn: async (tutorial: Omit<VideoTutorial, "id" | "created_at" | "updated_at">) => {
      // Check if tutorial exists for this path
      const existing = tutorials?.find(t => t.page_path === tutorial.page_path);

      if (existing) {
        const { error } = await supabase
          .from("video_tutorials")
          .update({
            title: tutorial.title,
            description: tutorial.description,
            video_url: tutorial.video_url,
            thumbnail_url: tutorial.thumbnail_url,
            is_active: tutorial.is_active,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("video_tutorials")
          .insert(tutorial);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoTutorials"] });
      toast.success("Tutorial saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save tutorial: " + error.message);
    },
  });

  // Delete tutorial (admin only)
  const deleteTutorial = useMutation({
    mutationFn: async (tutorialId: string) => {
      const { error } = await supabase
        .from("video_tutorials")
        .delete()
        .eq("id", tutorialId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoTutorials"] });
      toast.success("Tutorial deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete tutorial: " + error.message);
    },
  });

  return {
    tutorials,
    tutorialsLoading,
    getTutorialForPage,
    saveTutorial: saveTutorial.mutate,
    deleteTutorial: deleteTutorial.mutate,
    isSaving: saveTutorial.isPending,
    isDeleting: deleteTutorial.isPending,
    isAdmin,
  };
};
