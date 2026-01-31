import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Medicine {
  id: string;
  brand_name: string;
  generic_name: string;
  brand_name_bn: string | null;
  dosage_form: string | null;
  strength: string | null;
  manufacturer: string | null;
  default_dosage: string | null;
}

export const useMedicines = () => {
  const { data: medicines = [], isLoading, error } = useQuery({
    queryKey: ["medicines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .order("brand_name");

      if (error) throw error;
      return data as Medicine[];
    },
  });

  const searchMedicines = (query: string) => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return medicines.filter(
      (m) =>
        m.brand_name.toLowerCase().includes(lowerQuery) ||
        m.generic_name.toLowerCase().includes(lowerQuery) ||
        m.brand_name_bn?.includes(query)
    );
  };

  return {
    medicines,
    isLoading,
    error,
    searchMedicines,
  };
};
