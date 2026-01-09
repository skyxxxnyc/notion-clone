import React, { useState } from "react";
import { useAppStore } from "@/store";
import { FileText, Table, Plus, Upload, FileStack } from "lucide-react";
import { TemplateBrowser } from "@/components/templates/TemplateBrowser";

export function QuickActionsWidget() {
    const { createPage, createDatabase, setCurrentPage, currentWorkspaceId } = useAppStore();
    const [showTemplates, setShowTemplates] = useState(false);

    const handleNewPage = async () => {
        const newPage = await createPage(null);
        setCurrentPage(newPage.id);
    };

    const handleNewDatabase = async () => {
        const newDatabase = await createDatabase(null);
        setCurrentPage(newDatabase.id);
    };

    const actions = [
        {
            icon: FileText,
            label: "New Page",
            onClick: handleNewPage,
            color: "text-blue-600",
            bgColor: "bg-blue-50 hover:bg-blue-100"
        },
        {
            icon: Table,
            label: "New Database",
            onClick: handleNewDatabase,
            color: "text-purple-600",
            bgColor: "bg-purple-50 hover:bg-purple-100"
        },
        {
            icon: FileStack,
            label: "Use Template",
            onClick: () => setShowTemplates(true),
            color: "text-green-600",
            bgColor: "bg-green-50 hover:bg-green-100"
        }
    ];

    return (
        <>
            <div className="grid grid-cols-1 gap-3">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${action.bgColor}`}
                        >
                            <div className={`${action.color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-sm text-neutral-900">
                                {action.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {showTemplates && currentWorkspaceId && (
                <TemplateBrowser
                    onClose={() => setShowTemplates(false)}
                    workspaceId={currentWorkspaceId}
                />
            )}
        </>
    );
}
