import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET - List all knowledge bases in workspace
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("knowledge_bases")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching knowledge bases:", error);
      return NextResponse.json(
        { error: "Failed to fetch knowledge bases", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ knowledgeBases: data });
  } catch (error: any) {
    console.error("Error in knowledge base GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new knowledge base
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { workspaceId, name, description, icon, color } = body;

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "Workspace ID and name are required" },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("knowledge_bases")
      .insert({
        workspace_id: workspaceId,
        name,
        description,
        icon,
        color,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating knowledge base:", error);
      return NextResponse.json(
        { error: "Failed to create knowledge base", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ knowledgeBase: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error in knowledge base POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
