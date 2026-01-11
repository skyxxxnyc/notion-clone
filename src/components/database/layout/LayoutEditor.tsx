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
import { DatabaseLayout, LayoutModule, ModuleType, LAYOUT_PRESETS } from '@/types/layout';
import { SortableModule } from './SortableModule';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, Save, Plus, Heading, FileText, Link, FolderTree, LayoutGrid, Sparkles } from 'lucide-react';

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

const MODULE_TYPES: Array<{ type: ModuleType; label: string; icon: any; description: string }> = [
    { type: 'heading', label: 'Heading', icon: Heading, description: 'Page title, icon, and pinned properties' },
    { type: 'property_group', label: 'Property Group', icon: LayoutGrid, description: 'A group of properties' },
    { type: 'content', label: 'Content', icon: FileText, description: 'Rich text editor for page content' },
    { type: 'relation_group', label: 'Related Items', icon: Link, description: 'Items from a relation property' },
    { type: 'sub_items', label: 'Sub-items', icon: FolderTree, description: 'Child pages of this page' },
];

interface LayoutEditorPropsExtended extends LayoutEditorProps {
    databaseProperties?: any[];
}

export function LayoutEditor({ initialLayout, onSave, onCancel, databaseProperties = [] }: LayoutEditorPropsExtended) {
    const [layout, setLayout] = useState(initialLayout);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showModulePicker, setShowModulePicker] = useState(false);
    const [showPresetPicker, setShowPresetPicker] = useState(false);
    const [editingModule, setEditingModule] = useState<{ module: LayoutModule; container: 'mainArea' | 'sidePanel' } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const addModule = (type: ModuleType, target: 'mainArea' | 'sidePanel') => {
        const newModule: LayoutModule = {
            id: `${type}-${Date.now()}`,
            type,
            label: MODULE_TYPES.find(m => m.type === type)?.label
        };

        setLayout(prev => ({
            ...prev,
            [target]: [...prev[target], newModule]
        }));
        setShowModulePicker(false);
    };

    const removeModule = (moduleId: string, from: 'mainArea' | 'sidePanel') => {
        setLayout(prev => ({
            ...prev,
            [from]: prev[from].filter(m => m.id !== moduleId)
        }));
    };

    const toggleStructure = () => {
        setLayout(prev => ({
            ...prev,
            structure: prev.structure === 'simple' ? 'tabbed' : 'simple'
        }));
    };

    const applyPreset = (presetKey: keyof typeof LAYOUT_PRESETS) => {
        const preset = LAYOUT_PRESETS[presetKey];
        setLayout({ ...preset.layout });
        setShowPresetPicker(false);
    };

    const updateModule = (moduleId: string, container: 'mainArea' | 'sidePanel', updates: Partial<LayoutModule>) => {
        setLayout(prev => ({
            ...prev,
            [container]: prev[container].map(m =>
                m.id === moduleId ? { ...m, ...updates } : m
            )
        }));
    };

    const togglePinnedProperty = (propertyId: string) => {
        setLayout(prev => {
            const pinned = new Set(prev.pinnedPropertyIds);
            if (pinned.has(propertyId)) {
                pinned.delete(propertyId);
            } else if (pinned.size < 4) {
                pinned.add(propertyId);
            }
            return { ...prev, pinnedPropertyIds: Array.from(pinned) };
        });
    };

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
                <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-neutral-600 px-2">
                        Customize Layout
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPresetPicker(true)}
                            className="text-xs px-2 py-1 rounded bg-white border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1 text-neutral-900"
                        >
                            <Sparkles className="w-3 h-3" />
                            Presets
                        </button>
                        <button
                            onClick={toggleStructure}
                            className="text-xs px-2 py-1 rounded bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900"
                        >
                            {layout.structure === 'simple' ? '📄 Simple' : '📑 Tabbed'}
                        </button>
                        <select
                            value={layout.pageOpenMode || 'center_peek'}
                            onChange={(e) => setLayout(prev => ({ ...prev, pageOpenMode: e.target.value as any }))}
                            className="text-xs px-2 py-1 rounded bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900"
                        >
                            <option value="side_peek">Side Peek</option>
                            <option value="center_peek">Center Peek</option>
                            <option value="full_page">Full Page</option>
                        </select>
                    </div>
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

            {/* Preset Picker */}
            {showPresetPicker && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={() => setShowPresetPicker(false)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4 text-neutral-900">Layout Presets</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(LAYOUT_PRESETS).map(([key, { name, icon, layout: presetLayout }]) => (
                                <button
                                    key={key}
                                    onClick={() => applyPreset(key as keyof typeof LAYOUT_PRESETS)}
                                    className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 text-left transition-colors hover:border-neutral-300"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm text-neutral-900">{name}</div>
                                            <div className="text-xs text-neutral-600 mt-1">
                                                {presetLayout.structure === 'tabbed' ? 'Tabbed layout' : 'Simple layout'} •
                                                {' '}{presetLayout.mainArea.length} modules in main area
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Property Configuration Modal */}
            {editingModule && editingModule.module.type === 'property_group' && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={() => setEditingModule(null)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4 text-neutral-900">Configure Property Group</h3>

                        {/* Module Label */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Label</label>
                            <input
                                type="text"
                                value={editingModule.module.label || ''}
                                onChange={(e) => {
                                    const updated = { ...editingModule.module, label: e.target.value };
                                    setEditingModule({ ...editingModule, module: updated });
                                }}
                                className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm"
                                placeholder="Property Group"
                            />
                        </div>

                        {/* Property Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Properties to Show ({editingModule.module.propertyIds?.length || 'All'})
                            </label>
                            <div className="space-y-1 max-h-60 overflow-y-auto border border-neutral-200 rounded-md p-2">
                                {databaseProperties.map((prop: any) => {
                                    const isSelected = editingModule.module.propertyIds
                                        ? editingModule.module.propertyIds.includes(prop.id)
                                        : true;
                                    return (
                                        <label key={prop.id} className="flex items-center gap-2 p-2 hover:bg-neutral-50 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                    const current = editingModule.module.propertyIds || databaseProperties.map((p: any) => p.id);
                                                    const updated = e.target.checked
                                                        ? [...current, prop.id]
                                                        : current.filter((id: string) => id !== prop.id);
                                                    setEditingModule({
                                                        ...editingModule,
                                                        module: { ...editingModule.module, propertyIds: updated }
                                                    });
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm text-neutral-900">{prop.name}</span>
                                            <span className="text-xs text-neutral-500">({prop.type})</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setEditingModule(null)}
                                className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    updateModule(editingModule.module.id, editingModule.container, editingModule.module);
                                    setEditingModule(null);
                                }}
                                className="px-3 py-1.5 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pinned Properties Configuration */}
            {editingModule && editingModule.module.type === 'heading' && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={() => setEditingModule(null)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-2 text-neutral-900">Pin Properties to Heading (Max 4)</h3>
                        <p className="text-xs text-neutral-600 mb-4">
                            Pinned properties appear under the title and as the first visible columns in table view
                        </p>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                            {databaseProperties.map((prop: any) => {
                                const isPinned = layout.pinnedPropertyIds.includes(prop.id);
                                const canPin = layout.pinnedPropertyIds.length < 4 || isPinned;
                                const pinnedIndex = layout.pinnedPropertyIds.indexOf(prop.id);
                                return (
                                    <label
                                        key={prop.id}
                                        className={`flex items-center gap-2 p-2 hover:bg-neutral-50 rounded ${!canPin ? 'opacity-50' : 'cursor-pointer'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isPinned}
                                            disabled={!canPin}
                                            onChange={() => togglePinnedProperty(prop.id)}
                                            className="rounded"
                                        />
                                        {isPinned && (
                                            <span className="text-xs font-mono text-neutral-500 w-4">#{pinnedIndex + 1}</span>
                                        )}
                                        <span className="text-sm flex-1 text-neutral-900">{prop.name}</span>
                                        <span className="text-xs text-neutral-500">({prop.type})</span>
                                    </label>
                                );
                            })}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setEditingModule(null)}
                                className="px-3 py-1.5 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Module Picker */}
            {showModulePicker && (
                <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={() => setShowModulePicker(false)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4 text-neutral-900">Add Module</h3>
                        <div className="space-y-2">
                            {MODULE_TYPES.map(({ type, label, icon: Icon, description }) => (
                                <div key={type} className="border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50">
                                    <div className="flex items-start gap-3">
                                        <Icon className="w-5 h-5 text-neutral-600 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm text-neutral-900">{label}</div>
                                            <div className="text-xs text-neutral-600 mt-0.5">{description}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => addModule(type, 'mainArea')}
                                            className="flex-1 text-xs py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-900 font-medium"
                                        >
                                            + Main Area
                                        </button>
                                        <button
                                            onClick={() => addModule(type, 'sidePanel')}
                                            className="flex-1 text-xs py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-900 font-medium"
                                        >
                                            + Side Panel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
                        <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-sm text-neutral-700 uppercase tracking-wide">
                                Main Area
                            </div>
                            <button
                                onClick={() => setShowModulePicker(true)}
                                className="text-xs px-2 py-1 flex items-center gap-1 bg-white border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-900"
                            >
                                <Plus className="w-3 h-3" />
                                Add Module
                            </button>
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
                                    <SortableModule
                                        key={m.id}
                                        module={m}
                                        onRemove={() => removeModule(m.id, 'mainArea')}
                                        onConfigure={() => setEditingModule({ module: m, container: 'mainArea' })}
                                    />
                                ))}
                            </SortableContext>
                            {layout.mainArea.length === 0 && (
                                <div className="text-sm text-neutral-600 text-center py-8">
                                    Drop modules here or click "Add Module"
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="w-full md:w-80 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-sm text-neutral-700 uppercase tracking-wide">
                                Side Panel
                            </div>
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
                                    <SortableModule
                                        key={m.id}
                                        module={m}
                                        onRemove={() => removeModule(m.id, 'sidePanel')}
                                        onConfigure={() => setEditingModule({ module: m, container: 'sidePanel' })}
                                    />
                                ))}
                            </SortableContext>
                            {layout.sidePanel.length === 0 && (
                                <div className="text-sm text-neutral-600 text-center py-8">
                                    Drag modules here
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
