"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import type { KnowledgeBase } from "@/types/knowtbook";
import { SourceManager } from "./SourceManager";
import { Send, Sparkles, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KnowledgeBaseChatProps {
  knowledgeBase: KnowledgeBase;
}



const formatMessageContent = (content: string) => {
  // Split content by timestamp citation pattern: [Source Name, MM:SS]
  const pattern = /\[(.*?),\s*(\d{1,2}:\d{2}(?::\d{2})?)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    parts.push(
      <button
        key={match.index}
        className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium hover:underline cursor-pointer transition-colors"
        onClick={() => console.log(`Jump to ${match![1]} at ${match![2]}`)}
      >
        <span>▶</span>
        {match[1]} {match[2]}
      </button>
    );

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? parts : content;
};

export function KnowledgeBaseChat({ knowledgeBase }: KnowledgeBaseChatProps) {
  const { addChatMessage } = useAppStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [knowledgeBase.chatHistory]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message locally first
    addChatMessage(knowledgeBase.id, {
      role: "user",
      content: userMessage,
    });

    try {
      // Call real AI API
      const response = await fetch("/api/knowledge-base/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledgeBaseId: knowledgeBase.id,
          message: userMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add AI response
        addChatMessage(knowledgeBase.id, data.message);
      } else {
        const error = await response.json();
        console.error("AI response error:", error);
        addChatMessage(knowledgeBase.id, {
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.error || "Please try again."}`,
        });
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      addChatMessage(knowledgeBase.id, {
        role: "assistant",
        content: "Sorry, I encountered an error connecting to the AI service. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="knowledge-base-chat-container">
      {/* Source Manager */}
      <div className="knowledge-base-sources-panel">
        <SourceManager knowledgeBase={knowledgeBase} />
      </div>

      {/* Chat Panel */}
      <div className="knowledge-base-chat-panel">
        {/* Messages */}
        <div className="knowledge-base-messages">
          {knowledgeBase.chatHistory.length === 0 ? (
            <div className="knowledge-base-chat-empty">
              <Sparkles size={48} />
              <h3>START A CONVERSATION</h3>
              <p>
                Upload sources and ask questions about your knowledge base
              </p>
            </div>
          ) : (
            <>
              {knowledgeBase.chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`knowledge-base-message ${message.role}`}
                >
                  <div className="knowledge-base-message-content">
                    {formatMessageContent(message.content)}
                  </div>

                  {/* Source Citations */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="knowledge-base-citations">
                      <div className="knowledge-base-citations-header">
                        <FileText size={14} />
                        <span>Sources:</span>
                      </div>
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="knowledge-base-citation">
                          <ExternalLink size={12} />
                          <span>{source.sourceName}</span>
                          {source.pageNumber && (
                            <span className="knowledge-base-citation-page">
                              p. {source.pageNumber}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="knowledge-base-message assistant loading">
                  <div className="knowledge-base-message-content">
                    <span className="knowledge-base-loading-dots">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="knowledge-base-input-container">
          {knowledgeBase.sources.length === 0 && (
            <div className="knowledge-base-input-notice">
              <span>⚠️ Upload sources to start asking questions</span>
            </div>
          )}
          <div className="knowledge-base-input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything about your sources..."
              className="knowledge-base-input"
              disabled={isLoading || knowledgeBase.sources.length === 0}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || knowledgeBase.sources.length === 0}
              className="knowledge-base-send-btn"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
