"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createBlock(
    pageId: string,
    type: string,
    content: string = "",
    parentId: string | null = null,
    index: number = 0
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("blocks")
        .insert({
            page_id: pageId,
            type: type || "text",
            content: content || "",
            parent_id: parentId,
            index,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function updateBlock(id: string, updates: any) {
    const supabase = await createClient();
    const mappedUpdates: any = {};
    const keyMap: Record<string, string> = {
        pageId: "page_id",
        parentId: "parent_id",
    };

    Object.keys(updates).forEach((key) => {
        const mappedKey = keyMap[key] || key;
        mappedUpdates[mappedKey] = updates[key];
    });

    const { error } = await supabase
        .from("blocks")
        .update({
            ...mappedUpdates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) throw error;
}

export async function deleteBlock(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("blocks").delete().eq("id", id);

    if (error) throw error;
}

export async function getBlocks(pageId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("blocks")
        .select("*")
        .eq("page_id", pageId)
        .order("index", { ascending: true });

    if (error) throw error;
    return data;
}

export async function syncBlocks(pageId: string, blocks: any[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Start by deleting existing blocks for this page
    // In a production app, you'd want a more sophisticated diffing algorithm
    const { error: deleteError } = await supabase
        .from("blocks")
        .delete()
        .eq("page_id", pageId);

    if (deleteError) throw deleteError;

    if (blocks.length === 0) return [];

    // Map blocks to the database schema
    const blocksToInsert = blocks.map((block, index) => ({
        page_id: pageId,
        type: block.type || "text",
        content: block.content ?? "",
        properties: block.properties ?? {},
        parent_id: block.parentId ?? null,
        index,
        created_by: user.id,
    }));

    const { data, error: insertError } = await supabase
        .from("blocks")
        .insert(blocksToInsert)
        .select();

    if (insertError) {
        console.error("Block insert error:", insertError);
        console.error("Attempted to insert blocks:", JSON.stringify(blocksToInsert, null, 2));
        throw insertError;
    }
    return data;
}
