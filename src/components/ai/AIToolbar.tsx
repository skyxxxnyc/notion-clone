"use client";

import { useState } from "react";
import { Sparkles, Wand2, FileText, Table, Lightbulb } from "lucide-react";
import { transformText, type WritingAction } from "@/actions/ai";

interface AIToolbarProps {
    selectedText?: string;
    onTextTransform?: (newText: string) => void;
    onGeneratePage?: () => void;
    onGenerateTable?: () => void;
    onShowSuggestions?: () => void;
}

export default function AIToolbar({
    selectedText,
    onTextTransform,
    onGeneratePage,
    onGenerateTable,
    onShowSuggestions,
}: AIToolbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);

    const handleTextTransform = async (action: WritingAction) => {
        if (!selectedText || !onTextTransform) return;

        setIsTransforming(true);
        try {
            const transformed = await transformText(selectedText, action);
            onTextTransform(transformed);
            setIsOpen(false);
        } catch (error) {
            console.error("Text transformation failed:", error);
            alert("Failed to transform text. Please try again.");
        } finally {
            setIsTransforming(false);
        }
    };

    return (
        <div className="ai-toolbar">
            <button
                className="ai-toolbar-trigger"
                onClick={() => setIsOpen(!isOpen)}
                title="AI Assistant"
            >
                <Sparkles size={16} />
                <span>AI</span>
            </button>

            {isOpen && (
                <div className="ai-toolbar-menu">
                    {/* Text Transformation (only if text is selected) */}
                    {selectedText && (
                        <div className="ai-toolbar-section">
                            <div className="ai-toolbar-section-title">
                                <Wand2 size={14} />
                                Transform Text
                            </div>
                            <button
                                onClick={() => handleTextTransform("rewrite")}
                                disabled={isTransforming}
                                className="ai-toolbar-item"
                            >
                                Rewrite
                            </button>
                            <button
                                onClick={() => handleTextTransform("expand")}
                                disabled={isTransforming}
                                className="ai-toolbar-item"
                            >
                                Expand
                            </button>
                            <button
                                onClick={() => handleTextTransform("shorten")}
                                disabled={isTransforming}
                                className="ai-toolbar-item"
                            >
                                Shorten
                            </button>
                            <button
                                onClick={() => handleTextTransform("professional")}
                                disabled={isTransforming}
                                className="ai-toolbar-item"
                            >
                                Make Professional
                            </button>
                            <button
                                onClick={() => handleTextTransform("casual")}
                                disabled={isTransforming}
                                className="ai-toolbar-item"
                            >
                                Make Casual
                            </button>
                            <button
                                onClick={() => handleTextTransform("fix_grammar")}
                                disabled={isTransforming}
                                className="ai-toolbar-item"
                            >
                                Fix Grammar
                            </button>
                            <div className="ai-toolbar-divider" />
                        </div>
                    )}

                    {/* Generate Content */}
                    <div className="ai-toolbar-section">
                        <div className="ai-toolbar-section-title">
                            <FileText size={14} />
                            Generate
                        </div>
                        {onGeneratePage && (
                            <button onClick={onGeneratePage} className="ai-toolbar-item">
                                <FileText size={14} />
                                Generate Page from Topic
                            </button>
                        )}
                        {onGenerateTable && (
                            <button onClick={onGenerateTable} className="ai-toolbar-item">
                                <Table size={14} />
                                Generate Database Table
                            </button>
                        )}
                    </div>

                    {/* Smart Suggestions */}
                    {onShowSuggestions && (
                        <>
                            <div className="ai-toolbar-divider" />
                            <div className="ai-toolbar-section">
                                <button onClick={onShowSuggestions} className="ai-toolbar-item">
                                    <Lightbulb size={14} />
                                    Smart Suggestions
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
