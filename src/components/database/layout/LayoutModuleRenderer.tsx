import React from "react";
import { LayoutModule, DatabaseLayout } from "@/types/layout";
import { Page } from "@/types";
import { PageHeader } from "@/components/page/PageHeader";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { PropertyStack } from "./PropertyStack";
import { useAppStore } from "@/store";

interface Props {
    module: LayoutModule;
    page: Page;
    layout: DatabaseLayout;
    content?: string;
    onUpdateContent: (html: string, json: any) => void;
    readOnly?: boolean;
}

export function LayoutModuleRenderer({ module, page, layout, content, onUpdateContent, readOnly }: Props) {
    const { pages, databaseRows } = useAppStore();

    switch (module.type) {
        case "heading":
            // For heading, we also look at layout.pinnedPropertyIds
            return (
                <div className="mb-8 group">
                    <PageHeader
                        page={page}
                        onTitleChange={(title) => useAppStore.getState().updatePage(page.id, { title })}
                        onIconChange={(icon) => useAppStore.getState().updatePage(page.id, { icon })}
                        onCoverChange={(cover) => useAppStore.getState().updatePage(page.id, { coverImage: cover })}
                    />

                    {/* Pinned Properties (Horizontal) */}
                    {layout.pinnedPropertyIds.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                            {/* Use PropertyStack but styled horizontally? 
                  Or just reuse logic. For now, PropertyStack is vertical.
                  We might need a horizontal variant or manual rendering.
              */}
                            <PropertyStack
                                page={page}
                                propertyIds={layout.pinnedPropertyIds}
                                className="grid grid-cols-2 gap-x-8 w-full"
                            />
                        </div>
                    )}
                </div>
            );

        case "properties":
            return (
                <div className="mb-8">
                    <PropertyStack
                        page={page}
                        propertyIds={module.propertyIds}
                    />
                </div>
            );

        case "content":
            // We need to fetch blocks content? 
            // PageView handles fetching content.
            // But here we need to pass it to BlockEditor.

            // Note: In current architecture, PageView fetches blocks.
            // We need to get that content here.
            // For now, assuming BlockEditor fetches or store has it? 
            // BlockEditor currently takes `content` string.
            // The PageView logic passes `initialContent`.

            // Ideally, the parent component (DatabasePageLayout) manages content state.
            // We'll assume the parent passes correct props or we access store.

            // For this implementation, we rely on the parent DatabasePageLayout to pass the current content state
            // But BlockEditor manages its own state mostly.

            // Let's assume we use the same pattern as PageView
            return (
                <div className="min-h-[400px]">
                    <BlockEditor
                        pageId={page.id}
                        content={content || ""}
                        onChange={onUpdateContent}
                        editable={!readOnly}
                    />
                </div>
            );

        case "related_tabs":
            return (
                <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 mb-8">
                    <div className="text-sm text-neutral-500 font-medium">Related Items (Tabs Placeholder)</div>
                </div>
            );

        default:
            return null;
    }
}
