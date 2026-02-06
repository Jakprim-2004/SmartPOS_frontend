import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/utils/image';

export async function uploadImage(file: File, folder: string = 'general'): Promise<string> {
    try {
        // 1. Compress Image
        const compressed = await compressImage(file, { maxWidth: 800, quality: 0.7 });

        // 2. Prepare Path
        const fileExt = compressed.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // 3. Upload to Supabase 'images' bucket
        const { error: uploadError } = await supabase.storage
            .from('images') // Ensure this bucket exists in Supabase
            .upload(filePath, compressed, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        // 4. Get Public URL
        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('อัปโหลดรูปไม่สำเร็จ:', error);
        throw error;
    }
}

// Keep alias for compatibility if needed
export const uploadProductImage = (file: File) => uploadImage(file, 'products');
