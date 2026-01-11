import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImportPreview } from "./ImportPreview";
import { FileUploader } from "./FileUploader";
import { FieldMapper } from "./FieldMapper";
import { parseFile, markdownToBlocks } from "./utils";
import { ImportData, FieldMapping } from "./types";
import { useAppStore } from "@/store";
import { DatabaseProperty, BlockType } from "@/types";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { generateId } from "@/lib/utils";
import { bulkCreatePages } from "@/actions/pages";

interface ImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
    const [step, setStep] = useState<"upload" | "map">("upload");
    const [importData, setImportData] = useState<ImportData | null>(null);
    const [mappings, setMappings] = useState<FieldMapping[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const { createDatabase, updatePage, addPages, createPage, createBlock, setCurrentPage } = useAppStore();

    const importMarkdown = async (data: ImportData) => {
        try {
            const title = data.fileName.replace(/\.[^/.]+$/, "");
            const newPage = await createPage(null, title);

            if (data.content) {
                const blocks = markdownToBlocks(data.content);
                for (const [index, block] of blocks.entries()) {
                    await createBlock(
                        newPage.id,
                        block.type as BlockType,
                        block.content,
                        null,
                        index
                    );
                }
            }

            setCurrentPage(newPage.id);
            onOpenChange(false);
            setStep("upload");
        } catch (error) {
            console.error("Markdown import failed", error);
            alert("Failed to import markdown file");
        } finally {
            setIsImporting(false);
        }
    };

    const handleFileSelect = async (file: File) => {
        try {
            const data = await parseFile(file);
            setImportData(data);

            if (data.fileType === 'md') {
                setIsImporting(true);
                await importMarkdown(data);
            } else {
                setStep("map");
            }
        } catch (error) {
            console.error("Parse failed", error);
            alert("Failed to parse file");
        }
    };

    const handleImport = async () => {
        if (!importData) return;
        setIsImporting(true);

        try {
            // 1. Create Database
            const dbName = importData.fileName.replace(/\.[^/.]+$/, "");
            const newPage = await createDatabase(null, dbName); // Create as root page for now

            if (!newPage) throw new Error("Failed to create database");

            // 2. Construct Properties
            const titleMapping = mappings.find(m => m.enabled && m.isTitle);
            const properties: DatabaseProperty[] = [];

            // Handle Title property
            properties.push({
                id: 'title',
                name: titleMapping?.targetName || 'Name',
                type: 'title',
                isVisible: true,
                width: 250
            });

            // Add other properties with auto-generated options
            const optionColors = ["#e5e5e5", "#fef3c7", "#dcfce7", "#dbeafe", "#f3e8ff", "#fee2e2", "#ffedd5"];

            mappings.filter(m => m.enabled).forEach(m => {
                if (m === titleMapping) return;

                let options: any[] | undefined = undefined;

                // Auto-generate options for select types
                if (m.targetType === 'select' || m.targetType === 'multiSelect' || m.targetType === 'tags') {
                    const uniqueValues = new Set<string>();
                    importData.rows.forEach(row => {
                        const val = row[m.sourceKey];
                        if (val) {
                            if (Array.isArray(val)) {
                                val.forEach(v => uniqueValues.add(String(v).trim()));
                            } else {
                                // For tags, split by comma to create separate tag entities
                                if (m.targetType === 'tags') {
                                    const tagValues = String(val).split(',').map(t => t.trim()).filter(t => t);
                                    tagValues.forEach(t => uniqueValues.add(t));
                                } else {
                                    uniqueValues.add(String(val));
                                }
                            }
                        }
                    });

                    let colorIdx = 0;
                    options = Array.from(uniqueValues).map(v => ({
                        id: generateId(),
                        name: v,
                        color: optionColors[colorIdx++ % optionColors.length]
                    }));
                }

                properties.push({
                    id: generateId(),
                    name: m.targetName,
                    type: m.targetType,
                    isVisible: true,
                    width: 200,
                    options
                });
            });

            // Update Database Config
            await updatePage(newPage.id, {
                databaseConfig: {
                    properties: properties,
                    views: [{
                        id: generateId(),
                        name: "Table",
                        type: "table",
                        filters: [],
                        sorts: [],
                        visibleProperties: properties.map(p => p.id),
                        config: {}
                    }],
                    defaultViewId: "default"
                }
            });

            // 3. Create Rows using Bulk Action
            const CHUNK_SIZE = 100;
            const chunks: any[][] = [];

            for (let i = 0; i < importData.rows.length; i += CHUNK_SIZE) {
                chunks.push(importData.rows.slice(i, i + CHUNK_SIZE));
            }

            for (const chunk of chunks) {
                const chunkPayload = chunk.map(row => {
                    const rowProps: Record<string, any> = {};
                    let rowTitle = "Untitled";
                    const newId = generateId();

                    mappings.filter(m => m.enabled).forEach(m => {
                        let value = row[m.sourceKey];
                        let targetPropId = '';

                        if (m.isTitle) {
                            targetPropId = 'title';
                            rowTitle = String(value || "Untitled");
                        } else {
                            const p = properties.find(p => p.name === m.targetName);
                            targetPropId = p ? p.id : '';
                        }

                        if (targetPropId && targetPropId !== 'title') {
                            // For tags property, split comma-separated values into array
                            if (m.targetType === 'tags' && value && !Array.isArray(value)) {
                                value = String(value).split(',').map(t => t.trim()).filter(t => t);
                            }
                            rowProps[targetPropId] = value;
                        }
                    });

                    return {
                        id: newId,
                        title: rowTitle,
                        properties: rowProps
                    };
                });

                // Process chunk
                const createdPages = await bulkCreatePages(newPage.workspaceId, newPage.id, chunkPayload);
                addPages(createdPages);
            }

            onOpenChange(false);
        } catch (error) {
            console.error("Import failed", error);
            alert("Import failed: " + (error as Error).message);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import Data</DialogTitle>
                    <DialogDescription>
                        Import CSV, JSON, or Markdown into a new database.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 py-4 space-y-6">
                    {step === "upload" ? (
                        <FileUploader onFileSelect={handleFileSelect} />
                    ) : (
                        <div className="space-y-6">
                            {importData && <ImportPreview data={importData} mappings={mappings} />}

                            {importData && (
                                <FieldMapper
                                    data={importData}
                                    onChange={setMappings}
                                />
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between items-center sm:justify-between">
                    {step === "map" ? (
                        <>
                            <Button variant="ghost" onClick={() => setStep("upload")}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={handleImport} disabled={isImporting}>
                                {isImporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        Import {importData?.rows.length} rows
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <div />
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
