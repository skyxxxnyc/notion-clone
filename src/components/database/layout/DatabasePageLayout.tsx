import React, { useState } from "react";
import { Page } from "@/types";
import { DatabaseLayout, DEFAULT_DATABASE_LAYOUT } from "@/types/layout";
import { useAppStore } from "@/store";
import { LayoutModuleRenderer } from "./LayoutModuleRenderer";
import { cn } from "@/lib/utils";
import { LayoutEditor } from "./LayoutEditor";
import { Settings2 } from "lucide-react";

interface DatabasePageLayoutProps {
    page: Page;
    initialContent?: string;
    onContentChange: (blocks: any[]) => void;
}

export function DatabasePageLayout({
    page,
    initialContent,
    onContentChange
}: DatabasePageLayoutProps) {
    const { pages, databaseRows, updatePage } = useAppStore();
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
    const [isEditingLayout, setIsEditingLayout] = useState(false);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    // Find Parent Database
    const parentPage = page.parentId ? pages[page.parentId] : null;

    // Use config from parent database, or default
    const config = parentPage?.databaseConfig;
    const layout = config?.layout || DEFAULT_DATABASE_LAYOUT;

    // Initialize active tab for tabbed layouts
    React.useEffect(() => {
        if (layout.structure === 'tabbed' && layout.tabs && layout.tabs.length > 0 && !activeTabId) {
            setActiveTabId(layout.tabs[0].id);
        }
    }, [layout.structure, layout.tabs, activeTabId]);

    // Resolve properties for this row
    // If we are viewing a row, we need its data?
    // Actually PropertyStack takes page={page}, which is the row.
    // ...

    const handleSaveLayout = async (newLayout: DatabaseLayout) => {
        if (parentPage && parentPage.databaseConfig) {
            await updatePage(parentPage.id, {
                databaseConfig: {
                    ...parentPage.databaseConfig,
                    layout: newLayout
                }
            });
        }
        setIsEditingLayout(false);
    };

    if (isEditingLayout) {
        return (
            <div className="max-w-6xl mx-auto p-8">
                <LayoutEditor
                    initialLayout={layout}
                    onSave={handleSaveLayout}
                    onCancel={() => setIsEditingLayout(false)}
                    databaseProperties={parentPage?.databaseConfig?.properties || []}
                />
            </div>
        );
    }

    // Local state for side panel toggle (persisted in layout config theoretically, but local for now if not owner)
    // Actually Notion persists this per user or per database. Let's assume per database for now.
    // const isSidePanelOpen = layout.isSidePanelOpen; // Replaced by local state

    const toggleSidePanel = () => {
        // In a real app we'd update the database config
        // For now we can't easily update the parent's config from here without an action
        // So we'll just mock it or skip persistence for this demo
        console.log("Toggle side panel");
    };

    // Render based on layout structure
    if (layout.structure === 'tabbed') {
        const tabs = layout.tabs || [];
        const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

        return (
            <div className="flex w-full min-h-screen relative group/layout">
                {/* Customize Toggle */}
                <div className="absolute top-4 right-4 z-50 opacity-0 group-hover/layout:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsEditingLayout(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-md text-xs font-medium transition-colors shadow-sm border border-neutral-200"
                    >
                        <Settings2 className="h-3.5 w-3.5" />
                        Customize Page
                    </button>
                </div>

                {/* MAIN AREA - with heading + tabs */}
                <div className="flex-1 min-w-0 transition-all duration-300 flex flex-col">
                    <div className="max-w-4xl w-full mx-auto px-12 py-12">
                        {/* Render heading from mainArea */}
                        {layout.mainArea.map((module) => (
                            <LayoutModuleRenderer
                                key={module.id}
                                module={module}
                                page={page}
                                layout={layout}
                                content={initialContent}
                                onUpdateContent={onContentChange}
                            />
                        ))}

                        {/* Tab Bar */}
                        <div className="border-b border-neutral-200 mb-6 -mx-12 px-12">
                            <div className="flex gap-6">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTabId(tab.id)}
                                        className={cn(
                                            "pb-2 px-1 text-sm font-medium transition-colors relative",
                                            activeTabId === tab.id
                                                ? "text-neutral-900"
                                                : "text-neutral-500 hover:text-neutral-700"
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            {tab.tabIcon && <span>{tab.tabIcon}</span>}
                                            {tab.label}
                                        </span>
                                        {activeTabId === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Tab Content */}
                        {activeTab && (
                            <div className="min-h-[400px]">
                                <LayoutModuleRenderer
                                    key={activeTab.id}
                                    module={activeTab}
                                    page={page}
                                    layout={layout}
                                    content={initialContent}
                                    onUpdateContent={onContentChange}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDE PANEL */}
                {isSidePanelOpen && layout.sidePanel && layout.sidePanel.length > 0 && (
                    <div className="w-[340px] border-l border-neutral-200 bg-neutral-50/30 p-6 shrink-0 h-screen sticky top-0 overflow-y-auto hidden lg:block">
                        <div className="space-y-8">
                            {layout.sidePanel.map((module) => (
                                <LayoutModuleRenderer
                                    key={module.id}
                                    module={module}
                                    page={page}
                                    layout={layout}
                                    onUpdateContent={onContentChange}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Simple layout (default)
    return (
        <div className="flex w-full min-h-screen relative group/layout">
            {/* Customize Toggle */}
            <div className="absolute top-4 right-4 z-50 opacity-0 group-hover/layout:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsEditingLayout(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-md text-xs font-medium transition-colors shadow-sm border border-neutral-200"
                >
                    <Settings2 className="h-3.5 w-3.5" />
                    Customize Page
                </button>
            </div>

            {/* Side Panel Toggle Button */}
            {layout.sidePanel && layout.sidePanel.length > 0 && (
                <button
                    onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                    className="fixed right-4 bottom-4 z-50 lg:hidden p-2 bg-white shadow-lg rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-900"
                    title={isSidePanelOpen ? "Hide panel" : "Show panel"}
                >
                    <Settings2 className="h-4 w-4" />
                </button>
            )}

            {/* MAIN AREA */}
            <div className={cn(
                "flex-1 min-w-0 transition-all duration-300",
                "flex flex-col"
            )}>
                <div className="max-w-4xl w-full mx-auto px-12 py-12">
                    {layout.mainArea.map((module) => (
                        <LayoutModuleRenderer
                            key={module.id}
                            module={module}
                            page={page}
                            layout={layout}
                            content={initialContent}
                            onUpdateContent={onContentChange}
                        />
                    ))}
                </div>
            </div>

            {/* SIDE PANEL */}
            {isSidePanelOpen && layout.sidePanel && layout.sidePanel.length > 0 && (
                <div className="w-[340px] border-l border-neutral-200 bg-neutral-50/30 p-6 shrink-0 h-screen sticky top-0 overflow-y-auto hidden lg:block">
                    <div className="space-y-8">
                        {layout.sidePanel.map((module) => (
                            <LayoutModuleRenderer
                                key={module.id}
                                module={module}
                                page={page}
                                layout={layout}
                                onUpdateContent={onContentChange}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
