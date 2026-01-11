"use client";

import { useState } from "react";
import { useAgentStore } from "@/store/agentStore";
import { X, Plus, Trash2, Save, Edit2 } from "lucide-react";
import type { AgentMode } from "@/types/agent";
import "./agent-components.css";

interface AgentModeManagerProps {
    onClose: () => void;
}

export function AgentModeManager({ onClose }: AgentModeManagerProps) {
    const { modes, addCustomMode, updateMode, deleteMode } = useAgentStore();
    const [editingMode, setEditingMode] = useState<AgentMode | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        icon: "🤖",
        description: "",
        systemPrompt: "",
        personality: "",
        expertise: [] as string[],
    });

    const customModes = modes.filter((m) => !m.isBuiltIn);

    const handleStartCreate = () => {
        setIsCreating(true);
        setEditingMode(null);
        setFormData({
            name: "",
            icon: "🤖",
            description: "",
            systemPrompt: "",
            personality: "",
            expertise: [],
        });
    };

    const handleStartEdit = (mode: AgentMode) => {
        if (mode.isBuiltIn) return;
        setIsCreating(false);
        setEditingMode(mode);
        setFormData({
            name: mode.name,
            icon: mode.icon,
            description: mode.description,
            systemPrompt: mode.systemPrompt,
            personality: mode.personality || "",
            expertise: mode.expertise,
        });
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.systemPrompt.trim()) {
            alert("Name and System Prompt are required");
            return;
        }

        if (isCreating) {
            addCustomMode({
                name: formData.name,
                icon: formData.icon,
                description: formData.description,
                systemPrompt: formData.systemPrompt,
                personality: formData.personality || undefined,
                expertise: formData.expertise,
            });
        } else if (editingMode) {
            updateMode(editingMode.id, {
                name: formData.name,
                icon: formData.icon,
                description: formData.description,
                systemPrompt: formData.systemPrompt,
                personality: formData.personality || undefined,
                expertise: formData.expertise,
            });
        }

        setIsCreating(false);
        setEditingMode(null);
        setFormData({
            name: "",
            icon: "🤖",
            description: "",
            systemPrompt: "",
            personality: "",
            expertise: [],
        });
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this custom mode?")) {
            deleteMode(id);
            if (editingMode?.id === id) {
                setEditingMode(null);
                setIsCreating(false);
            }
        }
    };

    const handleAddExpertise = () => {
        const tag = prompt("Enter expertise tag:");
        if (tag?.trim()) {
            setFormData({
                ...formData,
                expertise: [...formData.expertise, tag.trim()],
            });
        }
    };

    const handleRemoveExpertise = (index: number) => {
        setFormData({
            ...formData,
            expertise: formData.expertise.filter((_, i) => i !== index),
        });
    };

    const isEditing = isCreating || editingMode !== null;

    return (
        <div className="agent-mode-manager-overlay">
            <div className="agent-mode-manager">
                {/* Header */}
                <div className="agent-mode-manager-header">
                    <h2>Custom Agent Modes</h2>
                    <button className="agent-icon-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="agent-mode-manager-content">
                    {/* Mode List */}
                    <div className="agent-mode-list">
                        <div className="agent-mode-list-header">
                            <h3>Your Custom Modes</h3>
                            <button className="agent-btn-primary" onClick={handleStartCreate}>
                                <Plus size={14} />
                                New Mode
                            </button>
                        </div>

                        {customModes.length === 0 ? (
                            <div className="agent-empty-state">
                                <p>No custom modes yet</p>
                                <button className="agent-btn-secondary" onClick={handleStartCreate}>
                                    Create your first mode
                                </button>
                            </div>
                        ) : (
                            <div className="agent-mode-items">
                                {customModes.map((mode) => (
                                    <div
                                        key={mode.id}
                                        className={`agent-mode-item ${editingMode?.id === mode.id ? "active" : ""}`}
                                    >
                                        <div className="agent-mode-item-info" onClick={() => handleStartEdit(mode)}>
                                            <span className="agent-mode-icon">{mode.icon}</span>
                                            <div>
                                                <div className="agent-mode-name">{mode.name}</div>
                                                <div className="agent-mode-desc">{mode.description}</div>
                                            </div>
                                        </div>
                                        <div className="agent-mode-item-actions">
                                            <button
                                                className="agent-icon-btn"
                                                onClick={() => handleStartEdit(mode)}
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className="agent-icon-btn"
                                                onClick={() => handleDelete(mode.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Editor */}
                    {isEditing && (
                        <div className="agent-mode-editor">
                            <div className="agent-mode-editor-header">
                                <h3>{isCreating ? "Create New Mode" : "Edit Mode"}</h3>
                            </div>

                            <div className="agent-form">
                                <div className="agent-form-row">
                                    <div className="agent-form-group" style={{ width: "80px" }}>
                                        <label>Icon</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="🤖"
                                            maxLength={2}
                                            className="agent-input-icon"
                                        />
                                    </div>
                                    <div className="agent-form-group" style={{ flex: 1 }}>
                                        <label>Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="My Custom Agent"
                                        />
                                    </div>
                                </div>

                                <div className="agent-form-group">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="What does this agent do?"
                                    />
                                </div>

                                <div className="agent-form-group">
                                    <label>System Prompt *</label>
                                    <textarea
                                        value={formData.systemPrompt}
                                        onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                        placeholder="You are a helpful assistant that..."
                                        rows={8}
                                    />
                                    <span className="agent-form-hint">
                                        Define the agent&apos;s role, capabilities, and instructions
                                    </span>
                                </div>

                                <div className="agent-form-group">
                                    <label>Personality (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.personality}
                                        onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                                        placeholder="Friendly, professional, concise..."
                                    />
                                </div>

                                <div className="agent-form-group">
                                    <label>Expertise Tags</label>
                                    <div className="agent-tags">
                                        {formData.expertise.map((tag, index) => (
                                            <span key={index} className="agent-tag">
                                                {tag}
                                                <button onClick={() => handleRemoveExpertise(index)}>
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        <button className="agent-tag-add" onClick={handleAddExpertise}>
                                            <Plus size={12} />
                                            Add tag
                                        </button>
                                    </div>
                                </div>

                                <div className="agent-form-actions">
                                    <button
                                        className="agent-btn-secondary"
                                        onClick={() => {
                                            setIsCreating(false);
                                            setEditingMode(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button className="agent-btn-primary" onClick={handleSave}>
                                        <Save size={14} />
                                        {isCreating ? "Create Mode" : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AgentModeManager;
