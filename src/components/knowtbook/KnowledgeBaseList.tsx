"use client";

import React from "react";
import { useAppStore } from "@/store";
import { Brain, FileText, Video, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KnowledgeBaseList() {
  const {
    knowledgeBases,
    setCurrentKnowledgeBase,
    deleteKnowledgeBase,
  } = useAppStore();

  const kbList = Object.values(knowledgeBases).filter((kb) => !kb.isArchived);

  if (kbList.length === 0) {
    return (
      <div className="knowtbook-empty-state">
        <Brain size={64} />
        <h3>NO KNOWLEDGE BASES YET</h3>
        <p>Create your first knowledge base to start organizing your sources</p>
      </div>
    );
  }

  return (
    <div className="knowledge-base-grid">
      {kbList.map((kb) => {
        const sourceCount = kb.sources.length;
        const messageCount = kb.chatHistory.length;
        const lastUpdated = new Date(kb.updatedAt).toLocaleDateString();

        return (
          <div
            key={kb.id}
            className="knowledge-base-card"
            onClick={() => setCurrentKnowledgeBase(kb.id)}
          >
            <div className="knowledge-base-card-header">
              <span className="knowledge-base-icon">{kb.icon}</span>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      `Delete "${kb.name}"? This action cannot be undone.`
                    )
                  ) {
                    deleteKnowledgeBase(kb.id);
                  }
                }}
                className="knowledge-base-delete-btn"
              >
                <Trash2 size={14} />
              </Button>
            </div>

            <h3 className="knowledge-base-card-title">{kb.name}</h3>
            {kb.description && (
              <p className="knowledge-base-card-desc">{kb.description}</p>
            )}

            <div className="knowledge-base-card-stats">
              <div className="knowledge-base-stat">
                <FileText size={14} />
                <span>{sourceCount} sources</span>
              </div>
              <div className="knowledge-base-stat">
                <Video size={14} />
                <span>{messageCount} messages</span>
              </div>
              <div className="knowledge-base-stat">
                <Calendar size={14} />
                <span>{lastUpdated}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
