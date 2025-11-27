import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET_NAME = 'tip-images';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const imageUploadService = {
  async uploadTipImage(file: File): Promise<UploadResult> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `tips/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Upload exception:', error);
      return { success: false, error: error.message || 'Erro ao fazer upload' };
    }
  },

  async deleteTipImage(imageUrl: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length < 2) return false;

      const filePath = urlParts[1];
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      return !error;
    } catch {
      return false;
    }
  }
};
