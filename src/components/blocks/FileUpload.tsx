"use client";

import React, { useCallback, useState } from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { Upload, File, X, FileText, FileAudio, FileVideo, FileImage, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  pageId: string;
  onUploadComplete?: (fileUrl: string, fileName: string, fileType: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  className?: string;
}

export function FileUpload({
  pageId,
  onUploadComplete,
  acceptedTypes,
  maxSize = 50 * 1024 * 1024, // 50MB default
  className,
}: FileUploadProps) {
  const { currentWorkspaceId } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: string; name: string; url: string; type: string; size: number }>
  >([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return FileImage;
    if (mimeType.startsWith("video/")) return FileVideo;
    if (mimeType.startsWith("audio/")) return FileAudio;
    if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File size exceeds ${formatFileSize(maxSize)} limit`);
      }

      // Validate file type if specified
      if (acceptedTypes && !acceptedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not accepted`);
      }

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", currentWorkspaceId || "");
      formData.append("pageId", pageId);

      // Upload to API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      // Add to uploaded files list
      const uploadedFile = {
        id: data.id,
        name: file.name,
        url: data.url,
        type: data.type,
        size: file.size,
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);

      // Call callback if provided
      if (onUploadComplete) {
        onUploadComplete(data.url, file.name, data.type);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i]);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [pageId, currentWorkspaceId]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/upload?fileId=${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
        )}
      >
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <Loader2 className="h-10 w-10 text-neutral-500 animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-neutral-500" />
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {uploading ? "Uploading..." : "Drop files here or click to browse"}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Max file size: {formatFileSize(maxSize)}
            </p>
          </div>

          <input
            type="file"
            onChange={handleFileInput}
            className="hidden"
            id={`file-upload-${pageId}`}
            accept={acceptedTypes?.join(",")}
            multiple
            disabled={uploading}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`file-upload-${pageId}`)?.click()}
            disabled={uploading}
            className="text-neutral-900 dark:text-neutral-100"
          >
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="space-y-1.5">
            {uploadedFiles.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"
                >
                  <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View
                    </a>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
