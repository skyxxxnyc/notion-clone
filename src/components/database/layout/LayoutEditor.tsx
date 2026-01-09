"use client";

import React, { useState, useCallback } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { DatabaseLayout, LayoutModule } from '@/types/layout';
import { SortableModule } from './SortableModule';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react';

interface LayoutEditorProps {
    initialLayout: DatabaseLayout;
    onSave: (layout: DatabaseLayout) => void;
    onCancel: () => void;
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export function LayoutEditor({ initialLayout, onSave, onCancel }: LayoutEditorProps) {
    const [layout, setLayout] = useState(initialLayout);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findContainer = (id: string) => {
        if (layout.mainArea.find(m => m.id === id)) return 'mainArea';
        if (layout.sidePanel.find(m => m.id === id)) return 'sidePanel';
        // If sorting over the container itself (empty case)
        if (id === 'mainArea') return 'mainArea';
        if (id === 'sidePanel') return 'sidePanel';
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setLayout((prev) => {
            const activeItems = prev[activeContainer as 'mainArea' | 'sidePanel'];
            const overItems = prev[overContainer as 'mainArea' | 'sidePanel'];

            const activeIndex = activeItems.findIndex((i) => i.id === activeId);
            const overIndex = overItems.findIndex((i) => i.id === overId);

            let newIndex;
            if (overId === overContainer) {
                // Determine if we dropped on the container itself
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;

                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer as 'mainArea' | 'sidePanel'].filter(
                        (item) => item.id !== activeId
                    ),
                ],
                [overContainer]: [
                    ...prev[overContainer as 'mainArea' | 'sidePanel'].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer as 'mainArea' | 'sidePanel'].slice(
                        newIndex,
                        prev[overContainer as 'mainArea' | 'sidePanel'].length
                    ),
                ],
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as string;
        const overId = over ? (over.id as string) : null;

        if (!overId) {
            setActiveId(null);
            return;
        }

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (activeContainer && overContainer && activeContainer === overContainer) {
            const activeIndex = layout[activeContainer as 'mainArea' | 'sidePanel'].findIndex(
                (i) => i.id === activeId
            );
            const overIndex = layout[overContainer as 'mainArea' | 'sidePanel'].findIndex(
                (i) => i.id === overId
            );

            if (activeIndex !== overIndex) {
                setLayout((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(
                        prev[activeContainer as 'mainArea' | 'sidePanel'],
                        activeIndex,
                        overIndex
                    ),
                }));
            }
        }

        setActiveId(null);
    };

    // Helper to find the active module object
    const activeModule =
        activeId ? (
            layout.mainArea.find(m => m.id === activeId) ||
            layout.sidePanel.find(m => m.id === activeId)
        ) : null;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-neutral-100 p-2 rounded-lg mb-4">
                <div className="text-sm font-medium text-neutral-600 px-2">
                    Customize Layout
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={onCancel}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                    </Button>
                    <Button size="sm" onClick={() => onSave(layout)}>
                        <Save className="h-4 w-4 mr-1" />
                        Save Layout
                    </Button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Main Area */}
                    <div className="flex-1 space-y-2">
                        <div className="font-semibold text-sm text-neutral-500 mb-2 uppercase tracking-wide">
                            Main Area
                        </div>
                        <div
                            className="bg-neutral-50/50 p-4 rounded-lg border-2 border-dashed border-neutral-200 min-h-[200px]"
                        >
                            <SortableContext
                                id="mainArea"
                                items={layout.mainArea.map(m => m.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {layout.mainArea.map(m => (
                                    <SortableModule key={m.id} module={m} />
                                ))}
                            </SortableContext>
                            {layout.mainArea.length === 0 && (
                                <div className="text-sm text-neutral-400 text-center py-8">
                                    Drop items here
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="w-full md:w-80 space-y-2">
                        <div className="font-semibold text-sm text-neutral-500 mb-2 uppercase tracking-wide">
                            Side Panel
                        </div>
                        <div
                            className="bg-neutral-50/50 p-4 rounded-lg border-2 border-dashed border-neutral-200 min-h-[200px]"
                        >
                            <SortableContext
                                id="sidePanel"
                                items={layout.sidePanel.map(m => m.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {layout.sidePanel.map(m => (
                                    <SortableModule key={m.id} module={m} />
                                ))}
                            </SortableContext>
                            {layout.sidePanel.length === 0 && (
                                <div className="text-sm text-neutral-400 text-center py-8">
                                    Empty
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeModule ? (
                        <SortableModule module={activeModule} overlay />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
