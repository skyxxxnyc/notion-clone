// KnowtbookLM Types - AI-Powered Knowledge Base System

export type SourceType = "document" | "video" | "audio" | "web" | "text";

export type SourceStatus = "uploading" | "processing" | "ready" | "error";

export interface KnowledgeSource {
  id: string;
  knowledgeBaseId: string;
  name: string;
  type: SourceType;
  url?: string;
  fileSize?: number;
  mimeType?: string;
  status: SourceStatus;
  content?: string; // Extracted text content
  metadata?: {
    pageCount?: number;
    duration?: number; // For videos/audio
    author?: string;
    createdDate?: string;
    [key: string]: any;
  };
  uploadedBy: string;
  uploadedAt: string;
  processedAt?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: SourceCitation[];
  timestamp: string;
}

export interface SourceCitation {
  sourceId: string;
  sourceName: string;
  quote: string;
  pageNumber?: number;
  timestamp?: number; // For video/audio
  relevanceScore?: number;
}

export interface KnowledgeBase {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sources: KnowledgeSource[];
  chatHistory: ChatMessage[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  settings?: {
    autoGenerateSummary?: boolean;
    citationStyle?: "inline" | "footnote";
    language?: string;
  };
}

export interface KnowtbookState {
  knowledgeBases: Record<string, KnowledgeBase>;
  currentKnowledgeBaseId: string | null;
  isUploadingSource: boolean;
  isChatting: boolean;
}
