import { supabase } from './supabase';

/**
 * Uploads an image to Supabase Storage
 * @param file The file to upload
 * @param bucket The bucket name (default: 'images')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(file: File, bucket: string = 'images'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `post-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
}
