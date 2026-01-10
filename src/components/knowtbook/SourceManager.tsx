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
  const { addSourceToKnowledgeBase, removeSourceFromKnowledgeBase } =
    useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");

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

    try {
      // Extract domain name for display
      const url = new URL(urlInput);
      const domain = url.hostname.replace("www.", "");

      // Call API to add web source
      const response = await fetch("/api/knowledge-base/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledgeBaseId: knowledgeBase.id,
          name: `${domain} - ${url.pathname}`,
          type: "web",
          url: urlInput,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local store with the new source
        addSourceToKnowledgeBase(knowledgeBase.id, data.source);
        console.log("Added URL source:", data.source);
        setUrlInput("");
        setShowUrlInput(false);
      } else {
        const error = await response.json();
        console.error("Failed to add URL:", error);
        alert(`Failed to add URL: ${error.error}`);
      }
    } catch (error) {
      console.error("Invalid URL:", error);
      alert("Please enter a valid URL");
    }

    setIsUploading(false);
  };

  const handleAddYoutube = async () => {
    if (!youtubeInput.trim()) return;

    setIsUploading(true);

    try {
      // Extract video ID from various YouTube URL formats
      let videoId = "";
      const url = youtubeInput.trim();

      if (url.includes("youtube.com/watch?v=")) {
        videoId = new URL(url).searchParams.get("v") || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
      } else {
        // Assume it's just the video ID
        videoId = url;
      }

      if (!videoId) {
        alert("Please enter a valid YouTube URL or video ID");
        setIsUploading(false);
        return;
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
        } else {
          console.warn("Could not fetch YouTube metadata");
        }
      } catch (fetchError) {
        console.warn("Could not fetch YouTube metadata:", fetchError);
      }

      // Add the source with the fetched metadata
      const newSource = addSourceToKnowledgeBase(knowledgeBase.id, {
        name: videoTitle,
        type: "video",
        status: "ready",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        metadata: {
          duration,
          author,
        },
        content: `Video: ${videoTitle}`,
      });

      console.log("Added YouTube source:", newSource);
      setYoutubeInput("");
      setShowYoutubeInput(false);
    } catch (error) {
      console.error("Invalid YouTube URL:", error);
      alert("Please enter a valid YouTube URL");
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
            <input
              type="url"
              placeholder="https://example.com/article"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddUrl();
                if (e.key === "Escape") {
                  setShowUrlInput(false);
                  setUrlInput("");
                }
              }}
              className="neo-input"
              style={{ fontSize: "12px" }}
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
            <input
              type="text"
              placeholder="https://youtube.com/watch?v=... or video ID"
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddYoutube();
                if (e.key === "Escape") {
                  setShowYoutubeInput(false);
                  setYoutubeInput("");
                }
              }}
              className="neo-input"
              style={{ fontSize: "12px" }}
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
