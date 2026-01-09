"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { generateId } from "@/lib/utils";
import { Page } from "@/types";

const mapPage = (row: any): Page => ({
    id: row.id,
    title: row.title,
    icon: row.icon,
    coverImage: row.cover_image,
    coverPosition: row.cover_position,
    parentId: row.parent_id,
    workspaceId: row.workspace_id,
    createdBy: row.created_by,
    lastEditedBy: row.last_edited_by,
    isArchived: row.is_archived,
    isFavourite: row.is_favourite,
    isTemplate: row.is_template,
    isDatabase: row.is_database,
    databaseConfig: row.database_config,
    properties: row.database_config?.values || row.properties || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    blocks: [],
    children: [],
    path: [],
});

export async function createPage(
    workspaceId: string,
    parentId: string | null = null,
    title: string = "Untitled",
    id?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    try {
        const { data, error } = await supabase
            .from("pages")
            .insert({
                ...(id ? { id } : {}),
                workspace_id: workspaceId,
                parent_id: parentId,
                title,
                created_by: user.id,
                last_edited_by: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error(`[createPage] Database error creating page "${title}":`, error);
            throw new Error(`Database error: ${error.message} (details: ${JSON.stringify(error)})`);
        }

        revalidatePath("/");
        return mapPage(data);
    } catch (e: any) {
        console.error(`[createPage] Unexpected error creating page "${title}":`, e);
        throw e;
    }
}

export async function bulkCreatePages(
    workspaceId: string,
    parentId: string,
    pages: { id?: string; title: string; properties: any }[]
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const rows = pages.map((p) => ({
        ...(p.id ? { id: p.id } : {}),
        workspace_id: workspaceId,
        parent_id: parentId,
        title: p.title,
        database_config: { values: p.properties },
        created_by: user.id,
        last_edited_by: user.id,
        is_database: false,
    }));

    const { data, error } = await supabase
        .from("pages")
        .insert(rows)
        .select();

    if (error) throw error;

    revalidatePath("/");
    return data.map(mapPage);
}

export async function updatePage(id: string, updates: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Handle properties by merging into database_config (fallback storage)
    if (updates.properties) {
        const { data: current } = await supabase
            .from("pages")
            .select("database_config")
            .eq("id", id)
            .single();

        const config = current?.database_config || {};
        updates.databaseConfig = {
            ...config,
            values: {
                ...(config.values || {}),
                ...updates.properties
            }
        };
        delete updates.properties;
    }

    const mappedUpdates: any = {};
    const keyMap: Record<string, string> = {
        title: "title",
        icon: "icon",
        coverImage: "cover_image",
        coverPosition: "cover_position",
        parentId: "parent_id",
        workspaceId: "workspace_id",
        isArchived: "is_archived",
        isFavourite: "is_favourite",
        isTemplate: "is_template",
        isDatabase: "is_database",
        databaseConfig: "database_config",
    };

    Object.keys(updates).forEach((key) => {
        const mappedKey = keyMap[key] || key;
        mappedUpdates[mappedKey] = updates[key];
    });

    try {
        const { data, error } = await supabase
            .from("pages")
            .update({
                ...mappedUpdates,
                last_edited_by: user.id,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error(`[updatePage] Database error updating page ${id}:`, error);
            throw new Error(`Database error: ${error.message} (details: ${JSON.stringify(error)})`);
        }

        revalidatePath("/");
        return mapPage(data);
    } catch (e: any) {
        console.error(`[updatePage] Unexpected error updating page ${id}:`, e);
        throw e;
    }
}

export async function deletePage(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("pages").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/");
}

export async function bulkDeletePages(ids: string[]) {
    const supabase = await createClient();
    const { error } = await supabase.from("pages").delete().in("id", ids);

    if (error) throw error;

    revalidatePath("/");
}

export async function getPages(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data.map(mapPage);
}
