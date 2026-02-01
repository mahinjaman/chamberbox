import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Investigation {
  id: string;
  name: string;
  name_bn: string | null;
  category: string | null;
  description: string | null;
}

export const useInvestigations = () => {
  const { data: investigations = [], isLoading, error } = useQuery({
    queryKey: ["investigations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investigations")
        .select("*")
        .order("category")
        .order("name");

      if (error) throw error;
      return data as Investigation[];
    },
  });

  const searchInvestigations = (query: string) => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return investigations.filter(
      (inv) =>
        inv.name.toLowerCase().includes(lowerQuery) ||
        inv.name_bn?.includes(query) ||
        inv.category?.toLowerCase().includes(lowerQuery)
    );
  };

  const getInvestigationsByCategory = () => {
    const grouped: Record<string, Investigation[]> = {};
    investigations.forEach((inv) => {
      const category = inv.category || "Other";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(inv);
    });
    return grouped;
  };

  return {
    investigations,
    isLoading,
    error,
    searchInvestigations,
    getInvestigationsByCategory,
  };
};
