"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, ChevronDown, Trash2, X, Plus, Sparkles, Settings } from "lucide-react";
import { useAgentStore } from "@/store/agentStore";
import { agentChat } from "@/actions/ai";
import type { AgentMessage } from "@/types/agent";
import { AgentModeManager } from "./AgentModeManager";
import "./agent-components.css";

interface AgentPanelProps {
    pageTitle?: string;
    pageContent?: string;
    selectedText?: string;
}

export function AgentPanel({ pageTitle, pageContent, selectedText }: AgentPanelProps) {
    const {
        isOpen,
        isLoading,
        activeMode,
        modes,
        conversations,
        currentConversationId,
        closePanel,
        setActiveMode,
        setLoading,
        startConversation,
        addMessage,
        clearConversation,
        getConversation,
    } = useAgentStore();

    const [input, setInput] = useState("");
    const [showModeSelector, setShowModeSelector] = useState(false);
    const [showModeManager, setShowModeManager] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Get or create conversation for current mode
    const currentConversation = activeMode
        ? getConversation(activeMode.id) || null
        : null;

    const messages = currentConversation?.messages || [];

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || !activeMode || isLoading) return;

        const userMessage = input.trim();
        setInput("");

        // Get or create conversation
        let convId = currentConversation?.id;
        if (!convId) {
            convId = startConversation(activeMode.id);
        }

        // Add user message
        addMessage(convId, { role: "user", content: userMessage });

        setLoading(true);

        try {
            // Get conversation history for context
            const history: { role: "user" | "assistant"; content: string }[] = messages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await agentChat(
                userMessage,
                activeMode.systemPrompt,
                activeMode.personality,
                {
                    pageTitle,
                    pageContent,
                    selectedText,
                    history,
                }
            );

            // Add assistant response
            addMessage(convId, { role: "assistant", content: response });
        } catch (error) {
            console.error("Agent chat error:", error);
            addMessage(convId, {
                role: "assistant",
                content: "I encountered an error. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, [input, activeMode, isLoading, currentConversation, messages, pageTitle, pageContent, selectedText, startConversation, addMessage, setLoading]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = () => {
        if (currentConversation) {
            clearConversation(currentConversation.id);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="agent-panel">
            {/* Header */}
            <div className="agent-panel-header">
                <div className="agent-mode-trigger" onClick={() => setShowModeSelector(!showModeSelector)}>
                    <span className="agent-mode-icon">{activeMode?.icon || "🤖"}</span>
                    <span className="agent-mode-name">{activeMode?.name || "Select Mode"}</span>
                    <ChevronDown size={14} className={`agent-chevron ${showModeSelector ? "open" : ""}`} />
                </div>
                <div className="agent-header-actions">
                    <button
                        className="agent-icon-btn"
                        onClick={handleClearChat}
                        title="Clear chat"
                        disabled={messages.length === 0}
                    >
                        <Trash2 size={14} />
                    </button>
                    <button
                        className="agent-icon-btn"
                        onClick={() => setShowModeManager(true)}
                        title="Manage modes"
                    >
                        <Settings size={14} />
                    </button>
                    <button className="agent-icon-btn" onClick={closePanel} title="Close">
                        <X size={14} />
                    </button>
                </div>

                {/* Mode Selector Dropdown */}
                {showModeSelector && (
                    <div className="agent-mode-dropdown">
                        {modes.map((mode) => (
                            <button
                                key={mode.id}
                                className={`agent-mode-option ${activeMode?.id === mode.id ? "active" : ""}`}
                                onClick={() => {
                                    setActiveMode(mode);
                                    setShowModeSelector(false);
                                }}
                            >
                                <span className="agent-mode-icon">{mode.icon}</span>
                                <div className="agent-mode-info">
                                    <span className="agent-mode-name">{mode.name}</span>
                                    <span className="agent-mode-desc">{mode.description}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="agent-messages">
                {messages.length === 0 ? (
                    <div className="agent-welcome">
                        <div className="agent-welcome-icon">
                            <Sparkles size={24} />
                        </div>
                        <h3>Hi! I&apos;m your {activeMode?.name || "AI Assistant"}</h3>
                        <p>{activeMode?.description || "How can I help you today?"}</p>

                        {/* Quick Actions */}
                        <div className="agent-quick-actions">
                            {activeMode?.id === "workspace-assistant" && (
                                <>
                                    <button onClick={() => setInput("Summarize this page")}>📝 Summarize page</button>
                                    <button onClick={() => setInput("What's on this page?")}>🔍 Analyze content</button>
                                </>
                            )}
                            {activeMode?.id === "productivity-coach" && (
                                <>
                                    <button onClick={() => setInput("Help me prioritize my tasks")}>⚡ Prioritize tasks</button>
                                    <button onClick={() => setInput("How can I focus better?")}>🎯 Improve focus</button>
                                </>
                            )}
                            {activeMode?.id === "content-writer" && (
                                <>
                                    <button onClick={() => setInput("Improve my writing")}>✍️ Improve writing</button>
                                    <button onClick={() => setInput("Make this more concise")}>📏 Shorten text</button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`agent-message ${msg.role}`}>
                            {msg.role === "assistant" && (
                                <div className="agent-message-avatar">
                                    <Bot size={16} />
                                </div>
                            )}
                            <div className="agent-message-content">
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="agent-message assistant">
                        <div className="agent-message-avatar">
                            <Bot size={16} />
                        </div>
                        <div className="agent-message-content agent-typing">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="agent-input-container">
                <textarea
                    ref={inputRef}
                    className="agent-input"
                    placeholder={`Ask ${activeMode?.name || "AI"}...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    className="agent-send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                >
                    <Send size={16} />
                </button>
            </div>

            {/* Mode Manager Modal */}
            {showModeManager && (
                <AgentModeManager onClose={() => setShowModeManager(false)} />
            )}
        </div>
    );
}

export default AgentPanel;
