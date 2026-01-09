"use client";

import { useState } from "react";
import { X, Sparkles, Table } from "lucide-react";
import { generateBulkTable, type GeneratedTable } from "@/actions/ai";

interface GenerateTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (table: GeneratedTable) => void;
}

export default function GenerateTableModal({
    isOpen,
    onClose,
    onGenerate,
}: GenerateTableModalProps) {
    const [description, setDescription] = useState("");
    const [rowCount, setRowCount] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!description.trim()) {
            alert("Please enter a description");
            return;
        }

        setIsGenerating(true);
        try {
            const generatedTable = await generateBulkTable(description, rowCount);
            onGenerate(generatedTable);
            setDescription("");
            setRowCount(10);
            onClose();
        } catch (error) {
            console.error("Table generation failed:", error);
            alert("Failed to generate table. Please try again.");
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
                        <Table size={20} />
                        <h2>Generate Database Table</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="description">What kind of database do you need?</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Customer relationship management system with contacts, companies, and deal tracking"
                            className="textarea-field"
                            rows={4}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="rowCount">Number of sample rows</label>
                        <input
                            id="rowCount"
                            type="number"
                            min={1}
                            max={50}
                            value={rowCount}
                            onChange={(e) => setRowCount(parseInt(e.target.value) || 10)}
                            className="input-field"
                        />
                    </div>

                    <div className="form-hint">
                        AI will generate a complete database with properties, sample data, and appropriate field types.
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={isGenerating}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleGenerate}
                        disabled={isGenerating || !description.trim()}
                    >
                        {isGenerating ? (
                            <>
                                <Sparkles size={16} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Generate Table
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
