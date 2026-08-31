import { supabase, isSupabaseConfigured } from '../supabase';

export const PET_PHOTO_BUCKET = 'pet-photos';
export const AVATAR_BUCKET = 'avatars';

/** Compress and resize image file to base64 Data URL (Max 800x800, JPEG 0.85) */
export function fileToBase64DataUrl(file: File, maxWidth = 800, maxHeight = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Upload a pet photo and return public URL or persistent compressed base64 Data URL */
export async function uploadPetPhoto(
  animalId: string,
  file: File,
  ownerId?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // 1. Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Invalid file type. Please upload an image.' };
    }

    // 2. Always generate compressed base64 Data URL as reliable persistent fallback
    const base64Url = await fileToBase64DataUrl(file);

    if (!isSupabaseConfigured || !supabase) {
      return { url: base64Url, error: null };
    }

    // 3. Formulate path by owner/pet structure
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const folderPath = ownerId ? `${ownerId}/${animalId}` : `pets/${animalId}`;
    const filePath = `${folderPath}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PET_PHOTO_BUCKET)
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.warn('[uploadPetPhoto] Supabase upload notice (using compressed fallback):', uploadError.message);
      return { url: base64Url, error: null };
    }

    const { data } = supabase.storage.from(PET_PHOTO_BUCKET).getPublicUrl(filePath);
    return { url: data.publicUrl || base64Url, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Failed to process image file.' };
  }
}

/** Upload a user avatar */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    const base64Url = await fileToBase64DataUrl(file, 300, 300);

    if (!isSupabaseConfigured || !supabase) {
      return { url: base64Url, error: null };
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      return { url: base64Url, error: null };
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    return { url: data.publicUrl || base64Url, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Failed to process avatar image.' };
  }
}

/** Delete a stored file */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) return { error: null };

  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error: error?.message || null };
}
