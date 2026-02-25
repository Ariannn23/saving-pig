import { supabase } from "@/lib/supabase";

export const storageService = {
  async uploadEvidence(file: File, userId: string) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("evidences")
      .upload(filePath, file);

    if (error) throw error;

    // Devolver la URL pública completa en lugar de solo el path
    return storageService.getPublicUrl(data.path);
  },

  async getPublicUrl(path: string) {
    const { data } = supabase.storage.from("evidences").getPublicUrl(path);
    return data.publicUrl;
  },
};
