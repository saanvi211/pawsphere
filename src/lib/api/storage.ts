import { supabase, isSupabaseConfigured } from '../supabase';

const BUCKET = 'pet-photos';

/** Upload a pet photo and return the public URL */
export async function uploadPetPhoto(
  animalId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    // Offline: create a local object URL (temp, not persisted)
    return { url: URL.createObjectURL(file), error: null };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `animals/${animalId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

/** Upload a user avatar */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { url: URL.createObjectURL(file), error: null };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `avatars/${userId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

/** Delete a stored file */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error: error?.message || null };
}
