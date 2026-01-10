"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import { KnowledgeBaseList } from "./KnowledgeBaseList";
import { KnowledgeBaseChat } from "./KnowledgeBaseChat";
import { Brain, Plus, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./knowtbook.css";

interface KnowtbookLMProps {
  onClose: () => void;
}

export function KnowtbookLM({ onClose }: KnowtbookLMProps) {
  const {
    knowledgeBases,
    currentKnowledgeBaseId,
    setCurrentKnowledgeBase,
    createKnowledgeBase,
  } = useAppStore();

  const [isCreatingKB, setIsCreatingKB] = useState(false);
  const [newKBName, setNewKBName] = useState("");

  const currentKB = currentKnowledgeBaseId
    ? knowledgeBases[currentKnowledgeBaseId]
    : null;

  const handleCreateKB = () => {
    if (newKBName.trim()) {
      const kb = createKnowledgeBase(newKBName.trim());
      setCurrentKnowledgeBase(kb.id);
      setNewKBName("");
      setIsCreatingKB(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-hidden">
      <div className="knowtbook-container">
        {!currentKB ? (
          // Knowledge Base List View
          <div className="knowtbook-list-view">
            {/* Header */}
            <div className="knowtbook-header">
              <div className="knowtbook-header-content">
                <div className="knowtbook-icon-wrapper">
                  <Brain size={32} />
                </div>
                <div>
                  <h1 className="knowtbook-title">KNOWTBOOKLM</h1>
                  <p className="knowtbook-subtitle">
                    AI-POWERED KNOWLEDGE BASE SYSTEM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsCreatingKB(true)}
                  className="neo-button-primary"
                >
                  <Plus size={16} />
                  NEW KNOWLEDGE BASE
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="text-neutral-400 hover:text-neutral-200"
                  title="Close"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

          {/* Create KB Form */}
          {isCreatingKB && (
            <div className="knowtbook-create-form">
              <input
                type="text"
                placeholder="Knowledge base name..."
                value={newKBName}
                onChange={(e) => setNewKBName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateKB();
                  if (e.key === "Escape") setIsCreatingKB(false);
                }}
                className="neo-input"
                autoFocus
              />
              <div className="knowtbook-create-actions">
                <Button
                  onClick={handleCreateKB}
                  disabled={!newKBName.trim()}
                  className="neo-button-primary"
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    setIsCreatingKB(false);
                    setNewKBName("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Knowledge Base List */}
          <KnowledgeBaseList />
        </div>
        ) : (
          // Knowledge Base Chat View
          <div className="knowtbook-chat-view">
            {/* Header with Back Button */}
            <div className="knowtbook-chat-header">
              <Button
                onClick={() => setCurrentKnowledgeBase(null)}
                variant="ghost"
                size="sm"
                className="knowtbook-back-btn"
              >
                <ArrowLeft size={16} />
                Back to Knowledge Bases
              </Button>
              <div className="knowtbook-chat-header-info">
                <span className="knowtbook-chat-kb-icon">{currentKB.icon}</span>
                <div>
                  <h2 className="knowtbook-chat-kb-name">{currentKB.name}</h2>
                  {currentKB.description && (
                    <p className="knowtbook-chat-kb-desc">{currentKB.description}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-neutral-400 hover:text-neutral-200"
                title="Close"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Chat Interface */}
            <KnowledgeBaseChat knowledgeBase={currentKB} />
          </div>
        )}
      </div>
    </div>
  );
}
