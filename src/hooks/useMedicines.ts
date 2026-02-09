import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapDatabaseError } from "@/lib/errors";

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

export interface MedicineInsert {
  brand_name: string;
  generic_name: string;
  strength?: string;
  dosage_form?: string;
  manufacturer?: string;
  default_dosage?: string;
  brand_name_bn?: string;
}

export const useMedicines = () => {
  const queryClient = useQueryClient();

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

  const createMedicine = useMutation({
    mutationFn: async (medicine: MedicineInsert) => {
      const { data, error } = await supabase
        .from("medicines")
        .insert([medicine])
        .select()
        .single();
      if (error) throw error;
      return data as Medicine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine added successfully");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const deleteMedicine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("medicines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine deleted");
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const deleteMedicinesBulk = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("medicines").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success(`${ids.length} medicines deleted`);
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  const createMedicinesBulk = useMutation({
    mutationFn: async (medicines: MedicineInsert[]) => {
      const { data, error } = await supabase
        .from("medicines")
        .insert(medicines)
        .select();
      if (error) throw error;
      return data as Medicine[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success(`${data.length} medicines added`);
    },
    onError: (error) => {
      toast.error(mapDatabaseError(error));
    },
  });

  return {
    medicines,
    isLoading,
    error,
    searchMedicines,
    createMedicine: createMedicine.mutateAsync,
    isCreating: createMedicine.isPending,
    deleteMedicine: deleteMedicine.mutate,
    deleteMedicinesBulk: deleteMedicinesBulk.mutate,
    isDeletingBulk: deleteMedicinesBulk.isPending,
    createMedicinesBulk: createMedicinesBulk.mutateAsync,
    isCreatingBulk: createMedicinesBulk.isPending,
  };
};
