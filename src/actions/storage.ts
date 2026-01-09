"use server";

import { createClient } from "@/lib/supabase-server";

export async function uploadCoverImage(file: File) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('covers')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);

    return publicUrl;
}

export async function deleteCoverImage(url: string) {
    const supabase = await createClient();

    // Extract file path from URL
    const urlParts = url.split('/covers/');
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
        .from('covers')
        .remove([filePath]);

    if (error) throw error;
}
