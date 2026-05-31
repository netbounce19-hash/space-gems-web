import { supabase } from '../lib/supabase';

export async function uploadFileToSupabase(file: File, folderPath: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${folderPath}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('space-gems-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error.message);
    throw error;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('space-gems-media')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
