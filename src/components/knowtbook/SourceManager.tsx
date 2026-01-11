"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import type { KnowledgeBase } from "@/types/knowtbook";
import {
  Upload,
  FileText,
  Video,
  File,
  Globe,
  X,
  Check,
  Loader2,
  Plus,
  Link,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SourceManagerProps {
  knowledgeBase: KnowledgeBase;
}

export function SourceManager({ knowledgeBase }: SourceManagerProps) {
  const { addSourceToKnowledgeBase, updateSourceInKnowledgeBase, removeSourceFromKnowledgeBase } =
    useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");

  // Poll for processing sources to update their status
  React.useEffect(() => {
    const processingSources = knowledgeBase.sources.filter(
      (s) => s.status === "processing" || s.status === "uploading"
    );

    if (processingSources.length === 0) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/knowledge-base/sources?knowledgeBaseId=${knowledgeBase.id}`
        );
        if (response.ok) {
          const data = await response.json();
          // Update sources in the store
          data.sources.forEach((dbSource: any) => {
            const localSource = knowledgeBase.sources.find(
              (s) => s.id === dbSource.id
            );
            if (
              localSource &&
              localSource.status !== dbSource.status
            ) {
              console.log(
                `Source ${dbSource.name} updated to status: ${dbSource.status}`
              );
              // Update the source status in the store
              updateSourceInKnowledgeBase(knowledgeBase.id, dbSource.id, {
                status: dbSource.status,
                content: dbSource.content,
                metadata: dbSource.metadata,
                processedAt: dbSource.processed_at,
                error: dbSource.error,
              });
            }
          });
        }
      } catch (error) {
        console.error("Error polling sources:", error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [knowledgeBase.sources, knowledgeBase.id, updateSourceInKnowledgeBase]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Determine source type
      let sourceType: "document" | "video" | "audio" | "text" = "document";
      if (file.type.startsWith("video/")) {
        sourceType = "video";
      } else if (file.type.startsWith("audio/")) {
        sourceType = "audio";
      } else if (file.type.startsWith("text/")) {
        sourceType = "text";
      }

      try {
        // Read file content for text-based files
        let content = "";
        if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
          content = await file.text();
        }

        // Call API to add source
        const response = await fetch("/api/knowledge-base/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            knowledgeBaseId: knowledgeBase.id,
            name: file.name,
            type: sourceType,
            fileSize: file.size,
            mimeType: file.type,
            content: content || `File uploaded: ${file.name}`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Update local store with the new source
          addSourceToKnowledgeBase(knowledgeBase.id, data.source);
          console.log("Added source:", data.source);
        } else {
          const error = await response.json();
          console.error("Failed to add source:", error);
          alert(`Failed to upload ${file.name}: ${error.error}`);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert(`Error uploading ${file.name}`);
      }
    }

    setIsUploading(false);
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;

    setIsUploading(true);
    const urls = urlInput.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    let successCount = 0;

    for (const urlStr of urls) {
      try {
        let url: URL;
        try {
          url = new URL(urlStr);
        } catch {
          console.warn(`Skipping invalid URL: ${urlStr}`);
          continue;
        }

        // Extract domain name for display
        const domain = url.hostname.replace("www.", "");

        // Call API to add web source
        const response = await fetch("/api/knowledge-base/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            knowledgeBaseId: knowledgeBase.id,
            name: `${domain} - ${url.pathname}`,
            type: "web",
            url: urlStr,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Update local store with the new source
          addSourceToKnowledgeBase(knowledgeBase.id, data.source);
          console.log("Added URL source:", data.source);
          successCount++;
        } else {
          const error = await response.json();
          console.error(`Failed to add URL ${urlStr}:`, error);
        }
      } catch (error) {
        console.error(`Invalid URL ${urlStr}:`, error);
      }
    }

    if (successCount > 0) {
      setUrlInput("");
      setShowUrlInput(false);
    }
    setIsUploading(false);
  };

  const handleAddYoutube = async () => {
    if (!youtubeInput.trim()) return;

    setIsUploading(true);
    const inputs = youtubeInput.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    let successCount = 0;

    for (const input of inputs) {
      try {
        // Extract video ID from various YouTube URL formats
        let videoId = "";
        const url = input;

        if (url.includes("youtube.com/watch?v=")) {
          videoId = new URL(url).searchParams.get("v") || "";
        } else if (url.includes("youtu.be/")) {
          videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
        } else if (url.includes("youtube.com/embed/")) {
          videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
        } else {
          // Check if it's a URL or just ID
          if (url.startsWith('http')) {
            try {
              const u = new URL(url);
              if (u.hostname.includes('youtube')) {
                videoId = u.searchParams.get("v") || "";
              }
            } catch { }
          }
          // Fallback to treating as ID if not found above
          if (!videoId) videoId = url;
        }

        if (!videoId) {
          console.warn(`Skipping invalid video input: ${input}`);
          continue;
        }

        // Fetch video metadata using our API
        let videoTitle = `YouTube - ${videoId}`;
        let duration = undefined;
        let author = undefined;

        try {
          const response = await fetch("/api/youtube", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoId }),
          });

          if (response.ok) {
            const data = await response.json();
            videoTitle = data.title || videoTitle;
            duration = data.duration;
            author = data.author;
          }
        } catch (fetchError) {
          console.warn("Could not fetch YouTube metadata:", fetchError);
        }

        // Add the source via API to process it properly
        const response = await fetch("/api/knowledge-base/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            knowledgeBaseId: knowledgeBase.id,
            name: videoTitle,
            type: "video",
            url: `https://www.youtube.com/watch?v=${videoId}`,
            metadata: {
              duration,
              author,
              videoId,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          addSourceToKnowledgeBase(knowledgeBase.id, data.source);
          console.log("Added YouTube source:", data.source);
          successCount++;
        } else {
          const error = await response.json();
          console.error(`Failed to add YouTube video ${videoId}:`, error);
        }
      } catch (error) {
        console.error(`Error processing YouTube input ${input}:`, error);
      }
    }

    if (successCount > 0) {
      setYoutubeInput("");
      setShowYoutubeInput(false);
    }
    setIsUploading(false);
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video size={16} />;
      case "document":
        return <FileText size={16} />;
      case "web":
        return <Globe size={16} />;
      default:
        return <File size={16} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <Check size={14} className="text-[#ccff00]" />;
      case "processing":
        return <Loader2 size={14} className="animate-spin" />;
      case "error":
        return <X size={14} className="text-red-500" />;
      default:
        return <Loader2 size={14} className="animate-spin" />;
    }
  };

  return (
    <div className="source-manager">
      <div className="source-manager-header">
        <h3 className="source-manager-title">SOURCES</h3>
        <span className="source-manager-count">
          {knowledgeBase.sources.length}
        </span>
      </div>

      {/* Upload Area */}
      <div
        className={`source-upload-area ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".pdf,.txt,.md,.doc,.docx,.mp4,.mov,.avi,.mkv"
          onChange={handleFileInput}
          className="source-upload-input"
        />
        <label htmlFor="file-upload" className="source-upload-label">
          <Upload size={24} />
          <span className="source-upload-text">
            {isUploading ? "UPLOADING..." : "DROP FILES OR CLICK"}
          </span>
          <span className="source-upload-hint">
            PDF, TXT, MD, DOC, VIDEO
          </span>
        </label>
      </div>

      {/* Add Source Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        {!showUrlInput && !showYoutubeInput && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(true)}
              className="w-full justify-start text-xs"
            >
              <Link size={14} className="mr-2" />
              Add Web URL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowYoutubeInput(true)}
              className="w-full justify-start text-xs"
            >
              <Youtube size={14} className="mr-2" />
              Add YouTube Video
            </Button>
          </>
        )}

        {/* URL Input */}
        {showUrlInput && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", border: "1px solid var(--neo-border-color)", background: "#000" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Globe size={14} className="text-[#ccff00]" />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
                ADD WEB URL
              </span>
            </div>
            <textarea
              placeholder="https://example.com/article&#10;https://another.com/post"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddUrl();
                if (e.key === "Escape") {
                  setShowUrlInput(false);
                  setUrlInput("");
                }
              }}
              className="neo-input min-h-[100px] resize-y"
              style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}
              autoFocus
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                onClick={handleAddUrl}
                disabled={!urlInput.trim() || isUploading}
                size="sm"
                className="neo-button-primary flex-1"
              >
                Add
              </Button>
              <Button
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput("");
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* YouTube Input */}
        {showYoutubeInput && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", border: "1px solid var(--neo-border-color)", background: "#000" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Youtube size={14} className="text-[#ccff00]" />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
                ADD YOUTUBE VIDEO
              </span>
            </div>
            <textarea
              placeholder="https://youtube.com/watch?v=...&#10;https://youtu.be/..."
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddYoutube();
                if (e.key === "Escape") {
                  setShowYoutubeInput(false);
                  setYoutubeInput("");
                }
              }}
              className="neo-input min-h-[100px] resize-y"
              style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}
              autoFocus
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                onClick={handleAddYoutube}
                disabled={!youtubeInput.trim() || isUploading}
                size="sm"
                className="neo-button-primary flex-1"
              >
                Add
              </Button>
              <Button
                onClick={() => {
                  setShowYoutubeInput(false);
                  setYoutubeInput("");
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Source List */}
      <div className="source-list">
        {knowledgeBase.sources.map((source) => (
          <div key={source.id} className="source-item">
            <div className="source-item-icon">{getSourceIcon(source.type)}</div>
            <div className="source-item-info">
              <div className="source-item-name" title={source.name}>
                {source.name}
              </div>
              <div className="source-item-meta">
                {source.type === "web" && source.url && (
                  <span>{new URL(source.url).hostname}</span>
                )}
                {source.type === "video" && source.url && source.url.includes("youtube") && (
                  <span>YouTube</span>
                )}
                {source.fileSize && (
                  <span>{(source.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                )}
                {source.metadata?.pageCount && (
                  <span>{source.metadata.pageCount} pages</span>
                )}
                {source.metadata?.duration && (
                  <span>{Math.floor(source.metadata.duration / 60)} min</span>
                )}
              </div>
            </div>
            <div className="source-item-status">
              {getStatusIcon(source.status)}
            </div>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() =>
                removeSourceFromKnowledgeBase(knowledgeBase.id, source.id)
              }
              className="source-item-remove"
              title="Remove source"
            >
              <X size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
