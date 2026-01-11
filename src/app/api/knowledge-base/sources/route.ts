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
      let sourceMetadata: any = body.metadata || {};

      if (type === "video" && url && url.includes("youtube")) {
        // Extract video ID from YouTube URL
        let videoId = sourceMetadata.videoId;
        if (!videoId) {
          const urlObj = new URL(url);
          videoId = urlObj.searchParams.get("v") || url.split("youtu.be/")[1]?.split("?")[0];
        }

        if (videoId) {
          let videoProcessed = false;
          try {
            console.log("Attempting native video analysis for:", videoId);

            // Dynamic imports for Node.js modules
            const { GoogleAIFileManager, FileState } = await import("@google/generative-ai/server");
            // const ytdl = (await import("@distube/ytdl-core")).default; // Broken
            const { downloadVideo, downloadTranscript } = await import("@/lib/youtube");
            const fs = await import("fs");
            const path = await import("path");
            const os = await import("os");
            // const { pipeline } = await import("stream/promises");

            // 1. Download Video to Temp
            const tempDir = os.tmpdir();
            const tempFilePath = path.join(tempDir, `yt-${videoId}-${Date.now()}.mp4`);

            console.log("Downloading video to:", tempFilePath);
            console.log("Downloading video to:", tempFilePath);
            // Use yt-dlp binary
            await downloadVideo(videoId, tempFilePath);

            // Check file size
            const stats = await fs.promises.stat(tempFilePath);
            console.log(`Video downloaded. Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

            // 2. Upload to Google AI
            const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "");
            const uploadResult = await fileManager.uploadFile(tempFilePath, {
              mimeType: "video/mp4",
              displayName: name || `YouTube-${videoId}`,
            });

            console.log("Uploaded to Gemini:", uploadResult.file.uri);

            // 3. Wait for processing
            let file = await fileManager.getFile(uploadResult.file.name);
            while (file.state === FileState.PROCESSING) {
              console.log("Waiting for video processing...");
              await new Promise((resolve) => setTimeout(resolve, 2000));
              file = await fileManager.getFile(uploadResult.file.name);
            }

            if (file.state === FileState.FAILED) {
              throw new Error("Gemini video processing failed.");
            }

            console.log("Video processed. Generating analysis...");

            // 4. Generate Content with Native Video Understanding
            const model = genAI.getGenerativeModel({
              model: "gemini-2.0-flash",
            });

            const prompt = `Analyze this video thoroughly.
            Video Title: ${name}
            
            Provide a deep multimodal analysis including:
            1. Executive Summary & Intent
            2. Visual Analysis (What is shown? Key scenes/slides/demos)
            3. Key spoken points and arguments
            4. Step-by-step walkthrough (if applicable)
            5. Sentiment and Tone
            
            Be specific about visual elements you see (e.g., "The speaker points to a graph showing...", "The code snippet demonstrates...").`;

            const result = await model.generateContent([
              {
                fileData: {
                  mimeType: file.mimeType,
                  fileUri: file.uri,
                },
              },
              { text: prompt },
            ]);

            const analysis = result.response.text();

            // Clean up temp file
            await fs.promises.unlink(tempFilePath).catch(console.error);

            // Clean up Gemini file
            await fileManager.deleteFile(file.name).catch(console.warn);

            processedContent = `NATIVE VIDEO ANALYSIS (Gemini 2.0 Vision + Audio)\n\n${analysis}`;
            sourceMetadata = {
              ...sourceMetadata,
              videoId,
              videoUri: file.uri,
              processedBy: "gemini-2.0-flash-multimodal",
              hasTranscript: true
            };
            videoProcessed = true;

          } catch (videoError) {
            console.warn("Native video processing failed, falling back to transcript:", videoError);
            // Fallback will occur below
          }

          if (!videoProcessed) {
            // Fallback to yt-dlp subtitles
            try {
              console.log("Fetching captions via yt-dlp...");
              // Use yt-dlp binary to get subtitle content
              const transcriptText = await downloadTranscript(videoId);

              if (transcriptText) {
                // Clean up VTT format a bit if needed, but Gemini handles it well.
                // VTT has timestamps "00:00:00.000 --> ...", we can keep them for context or strip them.
                // For now, keep as is, Gemini 2.0 is smart.
                const rawTranscript = transcriptText;

                if (rawTranscript) {
                  // Process transcript with Gemini
                  try {
                    const model = genAI.getGenerativeModel({
                      model: "gemini-2.0-flash",
                    });

                    const prompt = `Analyze this YouTube video transcript.
                     Video Title: ${name || "Unknown Video"}
                     
                     Provide a structured summary including:
                     1. Executive Summary
                     2. Key Takeaways
                     3. Content Breakdown
                     
                     Transcript:
                     ${rawTranscript.substring(0, 30000)}`;

                    const result = await model.generateContent(prompt);
                    const summary = result.response.text();

                    processedContent = `VIDEO ANALYSIS (Transcript Only via fallback)\n\n${summary}\n\n---\nRAW TRANSCRIPT:\n\n${rawTranscript}`;
                    sourceMetadata = {
                      ...sourceMetadata,
                      videoId,
                      hasTranscript: true,
                      processedBy: "gemini-2.0-flash-text-fallback",
                      originalTitle: name
                    };
                  } catch (aiError) {
                    console.warn("Gemini transcript summarization failed:", aiError);
                    processedContent = `Video Title: ${name}\n\nTranscript:\n${rawTranscript}`;
                    sourceMetadata = { ...sourceMetadata, videoId, hasTranscript: true };
                  }
                } else {
                  processedContent = `Video: ${name}\nURL: ${url}\n\nTranscript available but empty.`;
                }
              }
            } catch (ytError: any) {
              console.warn("yt-dlp transcript extraction failed:", ytError.message);
              processedContent = `Video: ${name}\nURL: ${url}\n\nTranscript not available (auto-captions might be disabled). Error: ${ytError.message}`;
              sourceMetadata = { ...sourceMetadata, videoId, hasTranscript: false };
            }
          }
        }
      } else if (type === "web" && url && process.env.GEMINI_API_KEY) {
        // Extract content from web page using Gemini
        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
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
          sourceMetadata = { url, extractedAt: new Date().toISOString() };
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
          metadata: sourceMetadata,
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
