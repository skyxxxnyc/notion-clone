import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Try GEMINI_API_KEY first, then GOOGLE_API_KEY as fallback
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    console.log("=== Knowledge Base Chat POST started ===");
    const supabase = await createClient();
    const body = await request.json();
    const { knowledgeBaseId, message } = body;
    console.log("Request body:", { knowledgeBaseId, message: message?.substring(0, 50) });

    if (!knowledgeBaseId || !message) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Knowledge base ID and message are required" },
        { status: 400 }
      );
    }

    // Get current user
    console.log("Getting current user...");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("User:", user?.id);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Debug: Check if knowledge base exists and user has access
    console.log("Checking knowledge base access...");
    const { data: kbCheck, error: kbCheckError } = await supabase
      .from("knowledge_bases")
      .select("id, workspace_id, name")
      .eq("id", knowledgeBaseId)
      .single();

    console.log("Knowledge base check result:", { kbCheck, kbCheckError });

    if (kbCheckError || !kbCheck) {
      console.error("Knowledge base not found or not accessible:", kbCheckError);
      return NextResponse.json(
        {
          error: "Knowledge base not found or not accessible",
          details: kbCheckError?.message || "Knowledge base does not exist",
          hint: "The knowledge base might not have been created in the database, or you don't have permission to access it."
        },
        { status: 403 }
      );
    }

    // Debug: Check workspace membership
    console.log("Checking workspace membership...");
    const { data: membership, error: membershipError } = await supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", kbCheck.workspace_id)
      .eq("user_id", user.id)
      .single();

    console.log("Membership check result:", { membership, membershipError });

    if (membershipError || !membership) {
      console.error("User is not a member of this workspace");
      return NextResponse.json(
        {
          error: "Access denied",
          details: "You are not a member of the workspace that owns this knowledge base",
          workspaceId: kbCheck.workspace_id,
          userId: user.id
        },
        { status: 403 }
      );
    }

    // Save user message
    console.log("Saving user message...");
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
    console.log("User message saved successfully");

    // Get all sources for this knowledge base
    console.log("Fetching sources...");
    const { data: sources, error: sourcesError } = await supabase
      .from("knowledge_sources")
      .select("*")
      .eq("knowledge_base_id", knowledgeBaseId)
      .eq("status", "ready");

    if (sourcesError) {
      console.error("Error fetching sources:", sourcesError);
    }
    console.log("Sources fetched:", sources?.length || 0);

    // Get recent chat history
    console.log("Fetching chat history...");
    const { data: chatHistory, error: historyError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("knowledge_base_id", knowledgeBaseId)
      .order("timestamp", { ascending: false })
      .limit(10);

    if (historyError) {
      console.error("Error fetching chat history:", historyError);
    }
    console.log("Chat history fetched:", chatHistory?.length || 0);

    // Prepare context from sources
    const contextText = sources
      ?.map(
        (source) =>
          `Source: ${source.name} (Type: ${source.type}, ID: ${source.id})\n${source.content || ""}`
      )
      .join("\n\n");

    // Generate AI response using Gemini or Perplexity
    if (!apiKey && !process.env.PERPLEXITY_API_KEY) {
      const mockResponse = {
        role: "assistant" as const,
        content: `Mock response: I would answer your question "${message}" based on the ${sources?.length || 0} sources in your knowledge base. Please configure GEMINI_API_KEY or PERPLEXITY_API_KEY to enable real AI responses.`,
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
      // Use Gemini 2.5 Flash (stable version supporting 1M tokens)
      const modelName = "gemini-2.5-flash";
      console.log("Attempting to generate AI response with Gemini");
      console.log("Model:", modelName);
      console.log("API Key present:", !!apiKey);

      const model = genAI.getGenerativeModel({
        model: modelName,
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

Please provide a helpful answer based on the available sources.
- If you reference specific sources, mention them by name.
- For VIDEO sources, if the context contains timestamps (e.g. [10:05]), please cite the timestamp in your answer like this: \`[Source Name, 10:05]\`. This is critical for navigation.
- Ensure the timestamp format is exactly \`[Source Name, MM:SS]\` or \`[Source Name, HH:MM:SS]\`.`;

      console.log("Calling Gemini API...");
      const result = await model.generateContent([prompt]);
      console.log("Gemini API response received");
      const responseText = result.response.text();
      console.log("Response text extracted:", responseText?.substring(0, 100));

      // Identify which sources were most relevant (basic keyword matching)
      const citedSources = sources
        ?.filter((source) => {
          const sourceKeywords = source.name.toLowerCase().split(" ");
          return sourceKeywords.some((keyword: string) =>
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
      console.error("Error details:", {
        message: aiError.message,
        stack: aiError.stack,
        name: aiError.name,
        response: aiError.response,
      });

      // Check if it's a quota error and try Perplexity as fallback
      const isQuotaError = aiError.message?.includes("quota") || aiError.message?.includes("429");

      if (isQuotaError && process.env.PERPLEXITY_API_KEY) {
        console.log("Gemini quota exceeded, falling back to Perplexity...");
        try {
          const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.1-sonar-small-128k-online",
              messages: [
                {
                  role: "system",
                  content: "You are a helpful AI assistant with access to a knowledge base. Answer based ONLY on the provided sources. If the answer isn't in the sources, say so."
                },
                {
                  role: "user",
                  content: `Context from knowledge base:\n${contextText || "No sources available yet."}\n\nRecent conversation:\n${chatHistory?.reverse().map((msg) => `${msg.role}: ${msg.content}`).join("\n")}\n\nUser question: ${message}`
                }
              ]
            })
          });

          const perplexityData = await perplexityResponse.json();
          const responseText = perplexityData.choices?.[0]?.message?.content || "I couldn't generate a response.";

          const assistantMessage = {
            role: "assistant" as const,
            content: responseText,
            sources: [],
          };

          await supabase.from("chat_messages").insert({
            knowledge_base_id: knowledgeBaseId,
            role: "assistant",
            content: assistantMessage.content,
            sources: assistantMessage.sources,
          });

          return NextResponse.json({ message: assistantMessage });
        } catch (perplexityError: any) {
          console.error("Perplexity fallback also failed:", perplexityError);
        }
      }

      const errorResponse = {
        role: "assistant" as const,
        content: `I'm sorry, I encountered an error while processing your question: ${isQuotaError ? "The AI service has exceeded its quota. Please try again later or configure an alternative API key." : (aiError.message || "Unknown error")}`,
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
