import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  videos: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
};

const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.videos,
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.audio,
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const workspaceId = formData.get("workspaceId") as string;
    const pageId = formData.get("pageId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    // Determine category
    let category = "files";
    if (ALLOWED_FILE_TYPES.images.includes(file.type)) category = "images";
    else if (ALLOWED_FILE_TYPES.videos.includes(file.type)) category = "videos";
    else if (ALLOWED_FILE_TYPES.audio.includes(file.type)) category = "audio";
    else if (ALLOWED_FILE_TYPES.documents.includes(file.type))
      category = "documents";

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${workspaceId}/${category}/${timestamp}-${sanitizedFileName}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("workspace-files")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file", details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("workspace-files").getPublicUrl(filePath);

    // Create file metadata record
    const { data: fileRecord, error: recordError } = await supabase
      .from("files")
      .insert({
        workspace_id: workspaceId,
        page_id: pageId || null,
        name: file.name,
        type: category,
        mime_type: file.type,
        size: file.size,
        storage_path: filePath,
        url: publicUrl,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (recordError) {
      console.error("Record error:", recordError);
      // Still return success with URL even if metadata save fails
      return NextResponse.json({
        url: publicUrl,
        name: file.name,
        type: category,
        mimeType: file.type,
        size: file.size,
        warning: "File uploaded but metadata save failed",
      });
    }

    return NextResponse.json({
      id: fileRecord.id,
      url: publicUrl,
      name: file.name,
      type: category,
      mimeType: file.type,
      size: file.size,
      storagePath: filePath,
    });
  } catch (error: any) {
    console.error("Error in file upload:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// GET - Retrieve file metadata
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const pageId = searchParams.get("pageId");
    const workspaceId = searchParams.get("workspaceId");

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (fileId) {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (error) {
        console.error("Error fetching file:", error);
        return NextResponse.json(
          { error: "Failed to fetch file", details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ file: data });
    }

    let query = supabase.from("files").select("*");

    if (pageId) {
      query = query.eq("page_id", pageId).order("uploaded_at", { ascending: false });
    } else if (workspaceId) {
      query = query.eq("workspace_id", workspaceId).order("uploaded_at", { ascending: false });
    } else {
      return NextResponse.json(
        { error: "fileId, pageId, or workspaceId required" },
        { status: 400 }
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching files:", error);
      return NextResponse.json(
        { error: "Failed to fetch files", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ files: data });
  } catch (error: any) {
    console.error("Error in files GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove file
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
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

    // Get file metadata
    const { data: fileData, error: fetchError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fetchError || !fileData) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("workspace-files")
      .remove([fileData.storage_path]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
    }

    // Delete metadata record
    const { error: deleteError } = await supabase
      .from("files")
      .delete()
      .eq("id", fileId);

    if (deleteError) {
      console.error("Metadata deletion error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete file metadata", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in file DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
