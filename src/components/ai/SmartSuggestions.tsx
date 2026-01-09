"use client";

import { useState, useEffect } from "react";
import { Lightbulb, X, Tag, CheckSquare, FileText } from "lucide-react";
import { generateSmartSuggestions, type SmartSuggestion } from "@/actions/ai";

interface SmartSuggestionsProps {
    isOpen: boolean;
    onClose: () => void;
    context: {
        currentTitle?: string;
        content?: string;
        existingTags?: string[];
        propertyValues?: Record<string, any>;
        pageType?: "page" | "database";
    };
    onApplySuggestion: (suggestion: SmartSuggestion) => void;
}

export default function SmartSuggestions({
    isOpen,
    onClose,
    context,
    onApplySuggestion,
}: SmartSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSuggestions();
        }
    }, [isOpen]);

    const loadSuggestions = async () => {
        setIsLoading(true);
        try {
            const generated = await generateSmartSuggestions(context);
            setSuggestions(generated);
        } catch (error) {
            console.error("Failed to generate suggestions:", error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getSuggestionIcon = (type: string) => {
        switch (type) {
            case "title":
                return <FileText size={16} />;
            case "tag":
                return <Tag size={16} />;
            case "action":
                return <CheckSquare size={16} />;
            default:
                return <Lightbulb size={16} />;
        }
    };

    const getSuggestionColor = (type: string) => {
        switch (type) {
            case "title":
                return "#3b82f6";
            case "tag":
                return "#8b5cf6";
            case "action":
                return "#10b981";
            default:
                return "#6b7280";
        }
    };

    if (!isOpen) return null;

    return (
        <div className="smart-suggestions-panel">
            <div className="smart-suggestions-header">
                <div className="smart-suggestions-title">
                    <Lightbulb size={18} />
                    <h3>Smart Suggestions</h3>
                </div>
                <button className="close-btn" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="smart-suggestions-body">
                {isLoading ? (
                    <div className="loading-state">
                        <Lightbulb size={24} className="animate-pulse" />
                        <p>Analyzing content...</p>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="empty-state">
                        <Lightbulb size={32} />
                        <p>No suggestions available</p>
                        <span>Add more content to get AI-powered suggestions</span>
                    </div>
                ) : (
                    <div className="suggestions-list">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="suggestion-item"
                                style={{ borderLeftColor: getSuggestionColor(suggestion.type) }}
                            >
                                <div className="suggestion-header">
                                    {getSuggestionIcon(suggestion.type)}
                                    <span className="suggestion-type">
                                        {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                                    </span>
                                    <span className="suggestion-confidence">
                                        {Math.round(suggestion.confidence * 100)}%
                                    </span>
                                </div>
                                <div className="suggestion-value">{suggestion.value}</div>
                                <button
                                    className="suggestion-apply-btn"
                                    onClick={() => {
                                        onApplySuggestion(suggestion);
                                        onClose();
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="smart-suggestions-footer">
                <button className="btn-text" onClick={loadSuggestions} disabled={isLoading}>
                    Refresh Suggestions
                </button>
            </div>
        </div>
    );
}
