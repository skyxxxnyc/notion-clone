import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { knowledgeBaseId, message } = body;

    if (!knowledgeBaseId || !message) {
      return NextResponse.json(
        { error: "Knowledge base ID and message are required" },
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

    // Save user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from("chat_messages")
      .insert({
        knowledge_base_id: knowledgeBaseId,
        role: "user",
        content: message,
      })
      .select()
      .single();

    if (userMessageError) {
      console.error("Error saving user message:", userMessageError);
      return NextResponse.json(
        { error: "Failed to save message", details: userMessageError.message },
        { status: 500 }
      );
    }

    // Get all sources for this knowledge base
    const { data: sources, error: sourcesError } = await supabase
      .from("knowledge_sources")
      .select("*")
      .eq("knowledge_base_id", knowledgeBaseId)
      .eq("status", "ready");

    if (sourcesError) {
      console.error("Error fetching sources:", sourcesError);
    }

    // Get recent chat history
    const { data: chatHistory, error: historyError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("knowledge_base_id", knowledgeBaseId)
      .order("timestamp", { ascending: false })
      .limit(10);

    if (historyError) {
      console.error("Error fetching chat history:", historyError);
    }

    // Prepare context from sources
    const contextText = sources
      ?.map(
        (source) =>
          `Source: ${source.name} (${source.type})\n${source.content?.substring(0, 2000) || ""}`
      )
      .join("\n\n");

    // Generate AI response using Gemini
    if (!process.env.GEMINI_API_KEY) {
      const mockResponse = {
        role: "assistant" as const,
        content: `Mock response: I would answer your question "${message}" based on the ${sources?.length || 0} sources in your knowledge base. Please configure GEMINI_API_KEY to enable real AI responses.`,
        sources: [],
      };

      // Save mock response
      await supabase.from("chat_messages").insert({
        knowledge_base_id: knowledgeBaseId,
        role: "assistant",
        content: mockResponse.content,
        sources: mockResponse.sources,
      });

      return NextResponse.json({ message: mockResponse });
    }

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });

      const prompt = `You are a helpful AI assistant with access to a knowledge base. Answer the user's question based ONLY on the provided sources. If the answer isn't in the sources, say so.

Context from knowledge base:
${contextText || "No sources available yet."}

Recent conversation:
${chatHistory
  ?.reverse()
  .map((msg) => `${msg.role}: ${msg.content}`)
  .join("\n")}

User question: ${message}

Please provide a helpful answer based on the available sources. If you reference specific sources, mention them by name.`;

      const result = await model.generateContent([prompt]);
      const responseText = result.response.text();

      // Identify which sources were most relevant (basic keyword matching)
      const citedSources = sources
        ?.filter((source) => {
          const sourceKeywords = source.name.toLowerCase().split(" ");
          return sourceKeywords.some((keyword) =>
            responseText.toLowerCase().includes(keyword)
          );
        })
        .slice(0, 3)
        .map((source) => ({
          sourceId: source.id,
          sourceName: source.name,
          quote: source.content?.substring(0, 200) || "",
        }));

      const assistantMessage = {
        role: "assistant" as const,
        content: responseText,
        sources: citedSources || [],
      };

      // Save assistant response
      await supabase.from("chat_messages").insert({
        knowledge_base_id: knowledgeBaseId,
        role: "assistant",
        content: assistantMessage.content,
        sources: assistantMessage.sources,
      });

      return NextResponse.json({ message: assistantMessage });
    } catch (aiError: any) {
      console.error("AI generation error:", aiError);

      const errorResponse = {
        role: "assistant" as const,
        content: `I'm sorry, I encountered an error while processing your question: ${aiError.message}`,
        sources: [],
      };

      // Save error response
      await supabase.from("chat_messages").insert({
        knowledge_base_id: knowledgeBaseId,
        role: "assistant",
        content: errorResponse.content,
        sources: errorResponse.sources,
      });

      return NextResponse.json({ message: errorResponse });
    }
  } catch (error: any) {
    console.error("Error in chat POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch chat history
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
      .from("chat_messages")
      .select("*")
      .eq("knowledge_base_id", knowledgeBaseId)
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Error fetching chat history:", error);
      return NextResponse.json(
        { error: "Failed to fetch chat history", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: data });
  } catch (error: any) {
    console.error("Error in chat GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
