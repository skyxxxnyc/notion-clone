"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function getWorkspaces() {
    const supabase = await createClient();

    console.log("Step 1: Getting authenticated user...");
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error getting user:", userError);
        throw userError;
    }

    if (!user) {
        console.error("No authenticated user");
        throw new Error("Unauthorized");
    }

    console.log("Step 2: User authenticated:", user.id, user.email);

    try {
        // Try simple count first to test table access
        console.log("Step 3: Testing workspace_members table access...");
        const { count, error: countError } = await supabase
            .from("workspace_members")
            .select("*", { count: 'exact', head: true });

        if (countError) {
            console.error("Error accessing workspace_members table:", countError);
            throw countError;
        }

        console.log("Step 4: workspace_members table accessible. Total rows:", count);

        // Now try to get memberships for current user only
        console.log("Step 5: Fetching memberships for user:", user.id);
        const { data: memberships, error: memberError } = await supabase
            .from("workspace_members")
            .select("workspace_id, user_id, role, joined_at")
            .eq("user_id", user.id);

        if (memberError) {
            console.error("Error fetching user's workspace_members:", memberError);
            console.error("Error code:", memberError.code);
            console.error("Error details:", memberError.details);
            console.error("Error hint:", memberError.hint);
            console.error("Error message:", memberError.message);
            throw memberError;
        }

        console.log("Step 6: Memberships query successful. Found:", memberships);

        if (!memberships || memberships.length === 0) {
            console.log("Step 7: User has no workspace memberships");
            return [];
        }

        const workspaceIds = memberships.map((m: any) => m.workspace_id);
        console.log("Step 8: Fetching workspaces with IDs:", workspaceIds);

        // Get all workspaces
        const { data, error } = await supabase
            .from("workspaces")
            .select("id, name, icon, owner_id, created_at, updated_at")
            .in("id", workspaceIds);

        if (error) {
            console.error("Error fetching workspaces:", error);
            throw error;
        }

        console.log("Step 9: Workspaces found:", data);
        return data || [];
    } catch (error) {
        console.error("getWorkspaces failed at some step:", error);
        throw error;
    }
}

export async function createWorkspace(name: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Use admin client to bypass RLS
    const adminClient = await createAdminClient();

    // Create workspace
    const { data: workspace, error: workspaceError } = await adminClient
        .from("workspaces")
        .insert({
            name,
            owner_id: user.id,
        })
        .select()
        .single();

    if (workspaceError) throw workspaceError;

    // Add user as owner in workspace_members
    const { error: memberError } = await adminClient
        .from("workspace_members")
        .insert({
            workspace_id: workspace.id,
            user_id: user.id,
            role: "owner",
        });

    if (memberError) throw memberError;

    revalidatePath("/");
    return workspace;
}

export async function updateWorkspace(id: string, updates: { name?: string; icon?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("workspaces")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    revalidatePath("/");
    return data;
}

export async function deleteWorkspace(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", id)
        .eq("owner_id", user.id); // Only owner can delete

    if (error) throw error;

    revalidatePath("/");
}

export async function resetUserAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Use Admin Client for deletion to bypass RLS issues
    const adminClient = await createAdminClient();

    // Delete all workspaces where user is owner
    const { error: deleteError } = await adminClient
        .from("workspaces")
        .delete()
        .eq("owner_id", user.id);

    if (deleteError) throw deleteError;

    // Create default workspace using regular client (as owner)
    // Actually, createWorkspace logic uses 'insert' policy which allows authenticated user.
    // So regular client is fine.
    const { data: workspace, error: createError } = await supabase
        .from("workspaces")
        .insert({
            name: "My Workspace",
            owner_id: user.id
        })
        .select()
        .single();

    if (createError) throw createError;

    // Add member
    await supabase.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner"
    });

    revalidatePath("/");
    return workspace;
}
