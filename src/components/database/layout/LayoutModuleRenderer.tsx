import React from "react";
import { LayoutModule, DatabaseLayout } from "@/types/layout";
import { Page } from "@/types";
import { PageHeader } from "@/components/page/PageHeader";
import { BlockNoteEditor } from "@/components/editor/BlockNoteEditor";
import { PropertyStack } from "./PropertyStack";
import { useAppStore } from "@/store";

interface Props {
    module: LayoutModule;
    page: Page;
    layout: DatabaseLayout;
    content?: string;
    onUpdateContent: (blocks: any[]) => void;
    readOnly?: boolean;
}

export function LayoutModuleRenderer({ module, page, layout, content, onUpdateContent, readOnly }: Props) {
    const { pages, databaseRows } = useAppStore();

    switch (module.type) {
        case "heading":
            // For heading, we show title/icon/cover + up to 4 pinned properties
            const pinnedIds = layout.pinnedPropertyIds.slice(0, 4);
            return (
                <div className="mb-8 group">
                    <PageHeader
                        page={page}
                        onTitleChange={(title) => useAppStore.getState().updatePage(page.id, { title })}
                        onIconChange={(icon) => useAppStore.getState().updatePage(page.id, { icon })}
                        onCoverChange={(cover) => useAppStore.getState().updatePage(page.id, { coverImage: cover })}
                    />

                    {/* Pinned Properties (Horizontal grid, max 4) */}
                    {pinnedIds.length > 0 && (
                        <div className="mt-4">
                            <PropertyStack
                                page={page}
                                propertyIds={pinnedIds}
                                className={`grid ${pinnedIds.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-x-8 gap-y-3 w-full`}
                            />
                        </div>
                    )}
                </div>
            );

        case "property_group":
            return (
                <div className="mb-8">
                    {module.label && (
                        <h3 className="text-sm font-semibold text-neutral-700 mb-3">{module.label}</h3>
                    )}
                    <PropertyStack
                        page={page}
                        propertyIds={module.propertyIds}
                        sections={module.sections}
                    />
                </div>
            );

        case "content":
            return (
                <div className="min-h-[400px]">
                    <BlockNoteEditor
                        initialBlocks={page.blocks || []}
                        onChange={onUpdateContent}
                        editable={!readOnly}
                    />
                </div>
            );

        case "relation_group":
            // Show related items from a relation property
            const parentPage = page.parentId ? pages[page.parentId] : null;
            const relationProp = parentPage?.databaseConfig?.properties.find(
                p => p.id === module.relationPropertyId
            );

            return (
                <div className="border border-neutral-200 rounded-lg p-4 mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-neutral-700">
                            {module.label || relationProp?.name || 'Related Items'}
                        </h3>
                        <button className="text-xs text-neutral-500 hover:text-neutral-700">
                            + Add
                        </button>
                    </div>
                    <div className="text-sm text-neutral-500">
                        No related items yet
                    </div>
                </div>
            );

        case "sub_items":
            // Show sub-pages/sub-items of this page
            const subPages = page.children
                .map(id => pages[id])
                .filter(Boolean);

            return (
                <div className="border border-neutral-200 rounded-lg p-4 mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-neutral-700">
                            {module.label || 'Sub-items'}
                        </h3>
                        <button className="text-xs text-neutral-500 hover:text-neutral-700">
                            + New
                        </button>
                    </div>
                    {subPages.length === 0 ? (
                        <div className="text-sm text-neutral-500">
                            No sub-items yet
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {subPages.map(subPage => (
                                <div key={subPage.id} className="text-sm hover:bg-neutral-50 px-2 py-1 rounded">
                                    {subPage.icon} {subPage.title || 'Untitled'}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
}
