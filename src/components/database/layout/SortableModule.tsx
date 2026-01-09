import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LayoutModule } from '@/types/layout';

interface SortableModuleProps {
    module: LayoutModule;
    overlay?: boolean;
}

export function SortableModule({ module, overlay }: SortableModuleProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "border border-neutral-200 bg-white rounded-md p-3 mb-2 flex items-center gap-3 shadow-sm select-none group",
                overlay && "ring-2 ring-blue-500 rotate-2 cursor-grabbing opacity-100 shadow-xl",
                !overlay && "hover:border-neutral-300"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    "cursor-grab text-neutral-400 opacity-50 group-hover:opacity-100 hover:text-neutral-900 transition-opacity",
                    overlay && "cursor-grabbing"
                )}
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <div className="flex-1">
                <span className="font-medium text-sm capitalize text-neutral-800">
                    {module.type === 'related_tabs' ? 'Tabs' : module.type}
                </span>
                <div className="text-[10px] text-neutral-400 font-mono">
                    ID: {module.id}
                </div>
            </div>
        </div>
    );
}
