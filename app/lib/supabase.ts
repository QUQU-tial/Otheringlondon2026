// Supabase client for image uploads
// Note: Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (typeof window === "undefined") return null;

  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      });
    } catch (error) {
      console.warn("Failed to create Supabase client:", error);
      return null;
    }
  }

  return supabaseClient;
};

export type ImageUploadResult = {
  url: string | null;
  error?: string;
  usedDataUrlFallback?: boolean;
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_DATA_URL_CHARS = 200_000; // ~150KB — never store huge data URLs in DB

function fileToDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image to the public `images` bucket.
 * Prefer real storage URLs. Data-URL fallback is only for tiny files when storage is down.
 */
export const uploadImageToSupabase = async (
  file: File,
  path: string,
  options?: { allowDataUrlFallback?: boolean }
): Promise<string | null> => {
  const result = await uploadImageToSupabaseDetailed(file, path, options);
  return result.url;
};

export const uploadImageToSupabaseDetailed = async (
  file: File,
  path: string,
  options?: { allowDataUrlFallback?: boolean }
): Promise<ImageUploadResult> => {
  const allowDataUrlFallback = options?.allowDataUrlFallback !== false;

  if (!file || file.size <= 0) {
    return { url: null, error: "Empty file." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      url: null,
      error: `Image is too large (${Math.round(file.size / 1024 / 1024)}MB). Please use a file under 8MB.`,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    if (!allowDataUrlFallback) {
      return { url: null, error: "Image storage is not configured." };
    }
    const dataUrl = await fileToDataUrl(file);
    if (!dataUrl || dataUrl.length > MAX_DATA_URL_CHARS) {
      return {
        url: null,
        error: "Image storage is not configured, and this file is too large to keep locally.",
      };
    }
    return { url: dataUrl, usedDataUrlFallback: true };
  }

  try {
    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${path.replace(/^\/+|\/+$/g, "")}/${fileName}`;

    const { error: uploadError } = await client.storage.from("images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || `image/${fileExt}`,
    });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      const msg = uploadError.message || "Upload failed";
      const bucketMissing = /bucket not found|NoSuchBucket/i.test(msg);

      if (!allowDataUrlFallback) {
        return {
          url: null,
          error: bucketMissing
            ? "Image storage bucket is missing. Ask the site admin to run scripts/storage-images-bucket.sql in Supabase."
            : `Image upload failed: ${msg}`,
        };
      }

      const dataUrl = await fileToDataUrl(file);
      if (dataUrl && dataUrl.length <= MAX_DATA_URL_CHARS) {
        return {
          url: dataUrl,
          usedDataUrlFallback: true,
          error: bucketMissing
            ? "Cloud image storage is missing; kept a small local preview only. Ask admin to create the images bucket."
            : `Cloud upload failed (${msg}); kept a small local preview only.`,
        };
      }
      return {
        url: null,
        error: bucketMissing
          ? "Image storage bucket is missing (run scripts/storage-images-bucket.sql in Supabase). This photo is too large to keep locally."
          : `Image upload failed: ${msg}`,
      };
    }

    const { data } = client.storage.from("images").getPublicUrl(filePath);
    return { url: data.publicUrl };
  } catch (error) {
    console.error("Image upload failed:", error);
    const message = error instanceof Error ? error.message : "Image upload failed";
    return { url: null, error: message };
  }
};

export const uploadMultipleImagesToSupabase = async (
  files: File[],
  path: string
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadImageToSupabase(file, path));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
};

/** Drop oversized data-URL images before writing to Supabase rows. */
export function sanitizeArtistImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("data:image") && url.length <= MAX_DATA_URL_CHARS) return url;
  return null;
}
