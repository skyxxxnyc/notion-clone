"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/store";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { ChevronRight, X } from "lucide-react";
import "./premium-page-view.css";

interface PremiumPageViewProps {
    pageId: string;
}

export function PremiumPageView({ pageId }: PremiumPageViewProps) {
    const { pages, updatePage } = useAppStore();
    const page = pages[pageId];
    const parentPage = page?.parentId ? pages[page.parentId] : null;

    const [editorContent, setEditorContent] = useState("");
    const [properties, setProperties] = useState({
        platform: page?.properties?.platform || "",
        objective: page?.properties?.objective || "",
        category: page?.properties?.category || "",
        tags: page?.properties?.tags || [],
        type: page?.properties?.type || "",
    });

    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newTitle = e.target.value;
            updatePage(pageId, { title: newTitle });

            // Auto-resize textarea
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
        },
        [pageId, updatePage]
    );

    const handlePropertyChange = useCallback(
        (key: string, value: any) => {
            const newProperties = { ...properties, [key]: value };
            setProperties(newProperties);
            updatePage(pageId, { properties: newProperties });
        },
        [pageId, properties, updatePage]
    );

    const handleAddTag = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                const newTag = e.currentTarget.value.trim();
                const newTags = [...(properties.tags || []), newTag];
                handlePropertyChange("tags", newTags);
                e.currentTarget.value = "";
            }
        },
        [properties.tags, handlePropertyChange]
    );

    const handleRemoveTag = useCallback(
        (tagToRemove: string) => {
            const newTags = (properties.tags || []).filter((tag) => tag !== tagToRemove);
            handlePropertyChange("tags", newTags);
        },
        [properties.tags, handlePropertyChange]
    );

    const handleContentChange = useCallback(
        (html: string, json?: any) => {
            setEditorContent(html);
        },
        []
    );

    if (!page) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-neutral-500">Page not found</p>
            </div>
        );
    }

    return (
        <div className="page-view-container">
            {/* Main Content */}
            <div className="page-content-main">
                {/* Breadcrumb */}
                <div className="page-breadcrumb-bar">
                    <div className="breadcrumb-item">
                        <span>THESE ARE THE ...</span>
                    </div>
                    <ChevronRight size={14} className="breadcrumb-separator" />
                    <div className="breadcrumb-item">
                        <span>{page.title || "Untitled"}</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="page-content-area">
                    {/* Page Title */}
                    <textarea
                        className="page-title-editable"
                        value={page.title}
                        onChange={handleTitleChange}
                        placeholder="Untitled"
                        rows={1}
                    />

                    {/* Property Groups (visible in content) */}
                    <div className="page-property-groups">
                        <div className="page-property-item">
                            <div className="page-property-label">Platform</div>
                            <div className="page-property-value">
                                {properties.platform || "Empty"}
                            </div>
                        </div>

                        <div className="page-property-item">
                            <div className="page-property-label">Perplexity</div>
                            <div className="page-property-value">
                                {properties.objective || "Empty"}
                            </div>
                        </div>

                        <div className="page-property-item">
                            <div className="page-property-label">Objective</div>
                            <div className="page-property-value empty">Empty</div>
                        </div>

                        <div className="page-property-item">
                            <div className="page-property-label">Empty</div>
                            <div className="page-property-value empty">Empty</div>
                        </div>
                    </div>

                    {/* Property Group Section */}
                    <div className="enhanced-prompt-section">
                        <div className="enhanced-prompt-title">Property Group</div>
                    </div>

                    {/* Enhanced Prompt */}
                    <div className="enhanced-prompt-section">
                        <div className="enhanced-prompt-title">Enhanced Prompt</div>
                        <div className="enhanced-prompt-content">
                            Leverage Perplexity's advanced real-time search capabilities to
                            develop a robust client acquisition strategy tailored for
                            [SOLOPRENEUR BUSINESS TYPE]. This strategy should focus on
                            generating a steady stream of leads efficiently, enabling you to
                            thrive without the need for a large team. Incorporate innovative
                            techniques and tools that maximize outreach and engagement while
                            minimizing resource expenditure.
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="page-editor-content">
                        <BlockEditor
                            content={editorContent}
                            onChange={handleContentChange}
                            pageId={pageId}
                            placeholder="Start writing..."
                        />
                    </div>
                </div>
            </div>

            {/* Properties Sidebar */}
            <div className="properties-sidebar">
                <h3 className="properties-sidebar-title">Properties</h3>

                {/* Platform */}
                <div className="property-field">
                    <label className="property-field-label">•</label>
                    <input
                        type="text"
                        className="property-field-input"
                        value={properties.platform}
                        onChange={(e) => handlePropertyChange("platform", e.target.value)}
                        placeholder="Yes"
                    />
                </div>

                {/* Platform Select */}
                <div className="property-field">
                    <label className="property-field-label">Platform</label>
                    <select
                        className="property-field-input property-field-select"
                        value={properties.platform}
                        onChange={(e) => handlePropertyChange("platform", e.target.value)}
                    >
                        <option value="">Select platform...</option>
                        <option value="Perplexity">Perplexity</option>
                        <option value="ChatGPT">ChatGPT</option>
                        <option value="Claude">Claude</option>
                        <option value="Gemini">Gemini</option>
                    </select>
                </div>

                {/* Category */}
                <div className="property-field">
                    <label className="property-field-label">Category</label>
                    <textarea
                        className="property-field-input property-field-textarea"
                        value={properties.category}
                        onChange={(e) => handlePropertyChange("category", e.target.value)}
                        placeholder="Client & Sales Content, Client Acquisition, Growth & Engagement"
                        rows={3}
                    />
                </div>

                {/* Objective */}
                <div className="property-field">
                    <label className="property-field-label">Objective</label>
                    <input
                        type="text"
                        className="property-field-input"
                        value={properties.objective}
                        onChange={(e) => handlePropertyChange("objective", e.target.value)}
                        placeholder="Empty"
                    />
                </div>

                {/* Tags */}
                <div className="property-field">
                    <label className="property-field-label">Tags</label>
                    <div className="property-tags-container">
                        {(properties.tags || []).map((tag, index) => (
                            <span key={index} className="property-tag">
                                {tag}
                                <button
                                    className="property-tag-remove"
                                    onClick={() => handleRemoveTag(tag)}
                                >
                                    <X size={10} />
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            className="property-tag-input"
                            placeholder="Add a tag..."
                            onKeyDown={handleAddTag}
                        />
                    </div>
                </div>

                {/* Type */}
                <div className="property-field">
                    <label className="property-field-label">Type</label>
                    <select
                        className="property-field-input property-field-select"
                        value={properties.type}
                        onChange={(e) => handlePropertyChange("type", e.target.value)}
                    >
                        <option value="">Select type...</option>
                        <option value="Detailed Prompt">Detailed Prompt</option>
                        <option value="Quick Prompt">Quick Prompt</option>
                        <option value="Template">Template</option>
                        <option value="Guide">Guide</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
