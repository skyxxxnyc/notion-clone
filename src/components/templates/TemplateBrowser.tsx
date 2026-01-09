import React, { useState } from "react";
import { TEMPLATE_LIBRARY, TEMPLATE_CATEGORIES, Template, TemplateCategory } from "@/lib/templates";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { X, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TemplateBrowserProps {
    onClose: () => void;
    workspaceId: string;
}

export function TemplateBrowser({ onClose, workspaceId }: TemplateBrowserProps) {
    const { createDatabase, updatePage, setCurrentPage } = useAppStore();
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const filteredTemplates = TEMPLATE_LIBRARY.filter((template) => {
        const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleUseTemplate = async (template: Template) => {
        try {
            // Create a new database page with the template's configuration
            const newDatabase = await createDatabase(null, template.name);

            // Update the database with the template's configuration
            await updatePage(newDatabase.id, {
                icon: template.icon,
                databaseConfig: {
                    ...template.databaseConfig,
                    layout: template.layout
                }
            });

            setCurrentPage(newDatabase.id);
            onClose();
        } catch (error) {
            console.error("Failed to create template:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-900">Template Library</h2>
                        <p className="text-sm text-neutral-500 mt-1">
                            Choose a pre-built template to get started quickly
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Search and Categories */}
                <div className="px-6 py-4 border-b border-neutral-200">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                selectedCategory === "all"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            )}
                        >
                            All Templates
                        </button>
                        {TEMPLATE_CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id as TemplateCategory)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                                    selectedCategory === category.id
                                        ? "text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                )}
                                style={{
                                    backgroundColor: selectedCategory === category.id ? category.color : undefined
                                }}
                            >
                                <span>{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Template Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map((template) => {
                            const category = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);
                            return (
                                <div
                                    key={template.id}
                                    className="group border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 hover:shadow-lg transition-all cursor-pointer bg-white"
                                    onClick={() => setPreviewTemplate(template)}
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
                                            style={{ backgroundColor: template.color + "20" }}
                                        >
                                            {template.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                {template.name}
                                            </h3>
                                            {category && (
                                                <div className="flex items-center gap-1 text-xs text-neutral-500">
                                                    <span>{category.icon}</span>
                                                    <span>{category.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                                        {template.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-neutral-500">
                                            {template.databaseConfig.properties.length} properties
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUseTemplate(template);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Use Template
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-neutral-400 mb-2">No templates found</div>
                            <div className="text-sm text-neutral-500">
                                Try a different category or search term
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            {previewTemplate && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
                    onClick={() => setPreviewTemplate(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                    style={{ backgroundColor: previewTemplate.color + "20" }}
                                >
                                    {previewTemplate.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-neutral-900">
                                        {previewTemplate.name}
                                    </h3>
                                    <p className="text-sm text-neutral-500">
                                        {TEMPLATE_CATEGORIES.find((c) => c.id === previewTemplate.category)?.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="text-neutral-400 hover:text-neutral-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <h4 className="font-medium text-neutral-900 mb-2">Description</h4>
                                <p className="text-neutral-600">{previewTemplate.description}</p>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium text-neutral-900 mb-3">Properties</h4>
                                <div className="space-y-2">
                                    {previewTemplate.databaseConfig.properties.map((prop) => (
                                        <div
                                            key={prop.id}
                                            className="flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-md"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span className="font-medium text-sm text-neutral-900">
                                                    {prop.name}
                                                </span>
                                            </div>
                                            <span className="text-xs text-neutral-500 capitalize">
                                                {prop.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium text-neutral-900 mb-3">Views</h4>
                                <div className="flex flex-wrap gap-2">
                                    {previewTemplate.databaseConfig.views.map((view) => (
                                        <div
                                            key={view.id}
                                            className="px-3 py-1.5 bg-neutral-100 rounded-md text-sm text-neutral-700 capitalize"
                                        >
                                            {view.type}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => {
                                        handleUseTemplate(previewTemplate);
                                        setPreviewTemplate(null);
                                    }}
                                    className="flex-1"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Use This Template
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewTemplate(null)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
