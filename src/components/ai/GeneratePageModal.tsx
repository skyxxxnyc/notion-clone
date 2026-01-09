"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { generatePageFromTopic, type GeneratedPage } from "@/actions/ai";

interface GeneratePageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (page: GeneratedPage) => void;
}

export default function GeneratePageModal({
    isOpen,
    onClose,
    onGenerate,
}: GeneratePageModalProps) {
    const [topic, setTopic] = useState("");
    const [pageType, setPageType] = useState<"guide" | "documentation" | "notes" | "project" | "general">("general");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            alert("Please enter a topic");
            return;
        }

        setIsGenerating(true);
        try {
            const generatedPage = await generatePageFromTopic(topic, pageType);
            onGenerate(generatedPage);
            setTopic("");
            onClose();
        } catch (error) {
            console.error("Page generation failed:", error);
            alert("Failed to generate page. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Sparkles size={20} />
                        <h2>Generate Page from Topic</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="topic">What would you like to create?</label>
                        <input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Project roadmap for mobile app launch"
                            className="input-field"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="pageType">Page Type</label>
                        <select
                            id="pageType"
                            value={pageType}
                            onChange={(e) => setPageType(e.target.value as any)}
                            className="select-field"
                        >
                            <option value="general">General</option>
                            <option value="guide">Step-by-Step Guide</option>
                            <option value="documentation">Documentation</option>
                            <option value="notes">Notes</option>
                            <option value="project">Project Plan</option>
                        </select>
                    </div>

                    <div className="form-hint">
                        AI will generate a complete page with sections, content, and structure based on your topic.
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={isGenerating}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic.trim()}
                    >
                        {isGenerating ? (
                            <>
                                <Sparkles size={16} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Generate Page
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
