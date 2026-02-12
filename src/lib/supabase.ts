import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Upload a blob to the `scans` storage bucket and return its public URL. */
export async function uploadScanImage(
    blob: Blob,
    fileName: string
): Promise<string> {
    const path = `${Date.now()}_${fileName}`;
    const { error } = await supabase.storage
        .from('scans')
        .upload(path, blob, { contentType: blob.type || 'image/png', upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from('scans').getPublicUrl(path);
    return data.publicUrl;
}
