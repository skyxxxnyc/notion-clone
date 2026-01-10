import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, action = "metadata" } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Always fetch basic metadata from oEmbed (no API key needed)
    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=${videoUrl}&format=json`
    );

    if (!oembedResponse.ok) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    const oembedData = await oembedResponse.json();

    // If just fetching metadata, return quickly
    if (action === "metadata") {
      return NextResponse.json({
        title: oembedData.title,
        author: oembedData.author_name,
        thumbnailUrl: oembedData.thumbnail_url,
      });
    }

    // If processing with Gemini, use video understanding
    if (action === "process" && process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-exp",
        });

        // Gemini processes YouTube videos by passing the URL directly
        const result = await model.generateContent([
          `Analyze this YouTube video: ${videoUrl}

Please provide a comprehensive analysis including:
1. A detailed transcript of the spoken content
2. Main topics and themes discussed
3. Key points with timestamps

Format as JSON with keys: transcript, topics (array), keyPoints (array of {timestamp, description}), duration (in seconds)`,
        ]);

        const response = await result.response;
        const text = response.text();

        let processedData: any = {};

        try {
          // Extract JSON from markdown code blocks if present
          const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            processedData = JSON.parse(jsonStr);
          }
        } catch (e) {
          console.warn("Could not parse Gemini response as JSON, using raw text");
          processedData = { transcript: text };
        }

        return NextResponse.json({
          title: oembedData.title,
          author: oembedData.author_name,
          thumbnailUrl: oembedData.thumbnail_url,
          ...processedData,
        });
      } catch (geminiError: any) {
        console.error("Gemini processing error:", geminiError);
        return NextResponse.json(
          {
            error: "Failed to process video with AI",
            details: geminiError.message,
          },
          { status: 500 }
        );
      }
    }

    // Fallback if no Gemini key
    return NextResponse.json({
      title: oembedData.title,
      author: oembedData.author_name,
      thumbnailUrl: oembedData.thumbnail_url,
      error: "Gemini API key not configured",
    });
  } catch (error: any) {
    console.error("Error processing YouTube video:", error);
    return NextResponse.json(
      { error: "Failed to process video", details: error.message },
      { status: 500 }
    );
  }
}
