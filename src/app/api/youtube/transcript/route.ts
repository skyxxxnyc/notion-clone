import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    try {
      // Fetch transcript using youtube-transcript library
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

      // Combine all transcript parts into a single text
      const transcript = transcriptData
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      return NextResponse.json({
        transcript,
        success: true,
      });
    } catch (transcriptError: any) {
      console.error("Failed to fetch YouTube transcript:", transcriptError);

      // Return error but don't fail completely
      return NextResponse.json(
        {
          error: "Transcript not available",
          details: transcriptError.message,
          transcript: "",
        },
        { status: 200 } // Return 200 so the source is still created
      );
    }
  } catch (error: any) {
    console.error("Error in YouTube transcript API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
