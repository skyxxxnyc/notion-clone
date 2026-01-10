import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient();

    // Create tables using individual queries
    const tables = [
      {
        name: "knowledge_bases",
        sql: `CREATE TABLE IF NOT EXISTS knowledge_bases (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          color TEXT,
          created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          is_archived BOOLEAN NOT NULL DEFAULT false,
          settings JSONB DEFAULT '{}'::jsonb
        )`,
      },
      {
        name: "knowledge_sources",
        sql: `CREATE TABLE IF NOT EXISTS knowledge_sources (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('document', 'video', 'audio', 'web', 'text')),
          url TEXT,
          file_size BIGINT,
          mime_type TEXT,
          status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
          content TEXT,
          metadata JSONB DEFAULT '{}'::jsonb,
          uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          processed_at TIMESTAMPTZ,
          error TEXT
        )`,
      },
      {
        name: "chat_messages",
        sql: `CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          sources JSONB DEFAULT '[]'::jsonb,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
        )`,
      },
    ];

    const results = [];

    for (const table of tables) {
      const { error } = await supabase.from(table.name).select("id").limit(1);

      if (error && error.code === "42P01") {
        // Table doesn't exist, we need to create it
        results.push({
          table: table.name,
          status: "needs_creation",
          message: "Table doesn't exist. Please run the SQL migration manually in your Supabase dashboard.",
        });
      } else if (error) {
        results.push({
          table: table.name,
          status: "error",
          error: error.message,
        });
      } else {
        results.push({
          table: table.name,
          status: "exists",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migration check completed",
      results,
      instructions: "If tables don't exist, please run the migration SQL file: supabase/migrations/20260109030000_create_knowledge_base.sql",
    });
  } catch (error: any) {
    console.error("Error checking migration:", error);
    return NextResponse.json(
      { error: "Failed to check migration", details: error.message },
      { status: 500 }
    );
  }
}
