import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// GET - List sources for a knowledge base
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const knowledgeBaseId = searchParams.get("knowledgeBaseId");

    if (!knowledgeBaseId) {
      return NextResponse.json(
        { error: "Knowledge base ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("knowledge_sources")
      .select("*")
      .eq("knowledge_base_id", knowledgeBaseId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching sources:", error);
      return NextResponse.json(
        { error: "Failed to fetch sources", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sources: data });
  } catch (error: any) {
    console.error("Error in sources GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add new source (file/URL)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { knowledgeBaseId, name, type, url, content, fileSize, mimeType } = body;

    if (!knowledgeBaseId || !name || !type) {
      return NextResponse.json(
        { error: "Knowledge base ID, name, and type are required" },
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

    // Insert source with processing status
    const { data: source, error: insertError } = await supabase
      .from("knowledge_sources")
      .insert({
        knowledge_base_id: knowledgeBaseId,
        name,
        type,
        url,
        file_size: fileSize,
        mime_type: mimeType,
        status: "processing",
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating source:", insertError);
      return NextResponse.json(
        { error: "Failed to create source", details: insertError.message },
        { status: 500 }
      );
    }

    // Process the content based on type
    try {
      let processedContent = content;
      let metadata: any = {};

      if (type === "web" && url && process.env.GEMINI_API_KEY) {
        // Extract content from web page using Gemini
        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
          });

          const result = await model.generateContent([
            `Extract the main text content from this webpage URL: ${url}

            Provide a clean, structured text extraction including:
            1. Main heading/title
            2. All body text
            3. Key points or sections

            Return only the extracted text, no additional commentary.`,
          ]);

          processedContent = result.response.text();
          metadata = { url, extractedAt: new Date().toISOString() };
        } catch (geminiError) {
          console.warn("Gemini extraction failed, using basic content:", geminiError);
          processedContent = content || `Content from URL: ${url}`;
        }
      } else if (type === "text") {
        processedContent = content;
      } else if (content) {
        // For uploaded files, content should already be extracted
        processedContent = content;
      }

      // Update source with processed content
      const { data: updatedSource, error: updateError } = await supabase
        .from("knowledge_sources")
        .update({
          content: processedContent,
          metadata,
          status: "ready",
          processed_at: new Date().toISOString(),
        })
        .eq("id", source.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating source:", updateError);
        // Return source anyway, even if update failed
        return NextResponse.json({ source }, { status: 201 });
      }

      return NextResponse.json({ source: updatedSource }, { status: 201 });
    } catch (processingError: any) {
      console.error("Error processing source:", processingError);

      // Update source status to error
      await supabase
        .from("knowledge_sources")
        .update({
          status: "error",
          error: processingError.message,
        })
        .eq("id", source.id);

      return NextResponse.json(
        {
          source,
          warning: "Source created but processing failed",
          error: processingError.message,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error in sources POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
