// Supabase client for image uploads
// Note: Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (typeof window === 'undefined') return null;
  
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return null;
    }
    
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    } catch (error) {
      console.warn('Failed to create Supabase client:', error);
      return null;
    }
  }
  
  return supabaseClient;
};

export const uploadImageToSupabase = async (file: File, path: string): Promise<string | null> => {
  const client = getSupabaseClient();
  
  if (!client) {
    // Fallback: convert to data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
  
  try {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error: uploadError } = await client.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Fallback to data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }
    
    // Get public URL
    const { data } = client.storage
      .from('images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    // Fallback to data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
};

export const uploadMultipleImagesToSupabase = async (files: File[], path: string): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageToSupabase(file, path));
  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
};

