import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface UploadResult {
  url: string;
  isStorageUrl: boolean;
  sizeFormatted: string;
}

const STORAGE_BUCKET = 'classroom_files';

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Uploads a file to the Supabase Storage bucket 'classroom_files'.
 * Returns the public URL if successful, or creates a local session URL fallback.
 */
export async function uploadClassroomFile(
  file: File | Blob,
  fileName: string,
  classroomId: string = 'general'
): Promise<UploadResult> {
  const sizeFormatted = formatFileSize(file.size);

  if (isSupabaseConfigured() && supabase) {
    try {
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${classroomId}/${Date.now()}_${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'application/octet-stream',
        });

      if (!uploadError) {
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
        if (data?.publicUrl) {
          return {
            url: data.publicUrl,
            isStorageUrl: true,
            sizeFormatted,
          };
        }
      } else {
        console.warn('Supabase storage upload failed, falling back to local reader:', uploadError.message);
      }
    } catch (err) {
      console.warn('Storage upload exception:', err);
    }
  }

  // Graceful fallback: FileReader for local development or when bucket is unavailable
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        url: (e.target?.result as string) || '#',
        isStorageUrl: false,
        sizeFormatted,
      });
    };
    reader.onerror = () => {
      resolve({
        url: '#',
        isStorageUrl: false,
        sizeFormatted,
      });
    };
    reader.readAsDataURL(file);
  });
}
