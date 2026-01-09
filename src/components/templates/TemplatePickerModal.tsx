"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { PAGE_TEMPLATES, type PageTemplate } from "@/config/page-templates";
import "./template-picker.css";

interface TemplatePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: PageTemplate) => void;
}

export function TemplatePickerModal({
    isOpen,
    onClose,
    onSelect,
}: TemplatePickerModalProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>("blank");

    const handleSelect = () => {
        const template = PAGE_TEMPLATES.find((t) => t.id === selectedTemplate);
        if (template) {
            onSelect(template);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content template-picker-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="modal-title-text">Choose a Template</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="template-grid">
                        {PAGE_TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                className={`template-option ${selectedTemplate === template.id ? "selected" : ""
                                    }`}
                                onClick={() => setSelectedTemplate(template.id)}
                            >
                                <div className="template-check">
                                    {selectedTemplate === template.id && <Check size={16} />}
                                </div>
                                <div className="template-icon">{template.icon}</div>
                                <div className="template-name">{template.name}</div>
                                <div className="template-description">
                                    {template.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSelect}>
                        Create Page
                    </button>
                </div>
            </div>
        </div>
    );
}
