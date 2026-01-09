"use server";

import { createClient } from "@supabase/supabase-js";

// Test function that bypasses RLS using service role
export async function testDatabaseAccess() {
    console.log("=== TEST: Starting database access test ===");

    try {
        // Create client with service role to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        console.log("TEST: Supabase client created with service role");

        // Test 1: Can we count workspace_members?
        console.log("TEST 1: Counting workspace_members...");
        const { count: memberCount, error: countError } = await supabase
            .from("workspace_members")
            .select("*", { count: 'exact', head: true });

        if (countError) {
            console.error("TEST 1 FAILED:", countError);
            return { success: false, error: "Count failed", details: countError };
        }

        console.log("TEST 1 SUCCESS: workspace_members count =", memberCount);

        // Test 2: Can we select all workspace_members?
        console.log("TEST 2: Selecting all workspace_members...");
        const { data: members, error: selectError } = await supabase
            .from("workspace_members")
            .select("*");

        if (selectError) {
            console.error("TEST 2 FAILED:", selectError);
            return { success: false, error: "Select failed", details: selectError };
        }

        console.log("TEST 2 SUCCESS: Found members:", members);

        // Test 3: Can we select workspaces?
        console.log("TEST 3: Selecting workspaces...");
        const { data: workspaces, error: workspaceError } = await supabase
            .from("workspaces")
            .select("*");

        if (workspaceError) {
            console.error("TEST 3 FAILED:", workspaceError);
            return { success: false, error: "Workspace select failed", details: workspaceError };
        }

        console.log("TEST 3 SUCCESS: Found workspaces:", workspaces);

        return {
            success: true,
            memberCount,
            members,
            workspaces
        };
    } catch (error) {
        console.error("TEST CRASHED:", error);
        return { success: false, error: "Exception thrown", details: error };
    }
}
