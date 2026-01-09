import React, { useCallback } from "react";
import { Upload, FileText, FileJson, FileType } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    className?: string;
}

export function FileUploader({ onFileSelect, className }: FileUploaderProps) {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                onFileSelect(files[0]);
            }
        },
        [onFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                onFileSelect(e.target.files[0]);
            }
        },
        [onFileSelect]
    );

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
                "border-2 border-dashed border-neutral-200 rounded-lg p-12 text-center hover:bg-neutral-50 hover:border-blue-500/50 transition-all cursor-pointer group",
                className
            )}
            onClick={() => document.getElementById("file-input")?.click()}
        >
            <input
                type="file"
                id="file-input"
                className="hidden"
                accept=".csv,.json,.md,.markdown"
                onChange={handleFileChange}
            />

            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-blue-500" />
            </div>

            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Upload a file
            </h3>
            <p className="text-sm text-neutral-500 mb-6 max-w-xs mx-auto">
                Drag and drop your file here, or click to browse.
                Supported formats: CSV, JSON, Markdown
            </p>

            <div className="flex justify-center gap-4 text-xs text-neutral-400">
                <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" /> CSV
                </div>
                <div className="flex items-center gap-1">
                    <FileJson className="h-3 w-3" /> JSON
                </div>
                <div className="flex items-center gap-1">
                    <FileType className="h-3 w-3" /> MD
                </div>
            </div>
        </div>
    );
}
