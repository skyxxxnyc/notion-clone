import React, { useState } from "react";
import { useAppStore } from "@/store";
import { Widget, DEFAULT_WIDGETS } from "@/types/widgets";
import { WidgetRenderer } from "./WidgetRenderer";
import { WidgetPicker } from "./WidgetPicker";
import { cn } from "@/lib/utils";
import { Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Dashboard() {
    const { currentWorkspaceId, workspaces } = useAppStore();
    const currentWorkspace = currentWorkspaceId
        ? workspaces.find(w => w.id === currentWorkspaceId)
        : null;

    // For demo, store widgets in local state. In a real app, persist to store/backend
    const [widgets, setWidgets] = useState<Widget[]>(
        DEFAULT_WIDGETS.map((w, i) => ({
            ...w,
            id: `widget-${i}`
        }))
    );
    const [isEditing, setIsEditing] = useState(false);
    const [showWidgetPicker, setShowWidgetPicker] = useState(false);

    const handleAddWidget = (widgetType: typeof DEFAULT_WIDGETS[0]) => {
        const newWidget: Widget = {
            ...widgetType,
            id: `widget-${Date.now()}`
        };
        setWidgets([...widgets, newWidget]);
        setShowWidgetPicker(false);
    };

    const handleRemoveWidget = (widgetId: string) => {
        setWidgets(widgets.filter(w => w.id !== widgetId));
    };

    const handleMoveWidget = (widgetId: string, direction: "up" | "down" | "left" | "right") => {
        setWidgets(widgets.map(w => {
            if (w.id !== widgetId) return w;
            const newPosition = { ...w.position };
            if (direction === "up") newPosition.y = Math.max(0, newPosition.y - 1);
            if (direction === "down") newPosition.y += 1;
            if (direction === "left") newPosition.x = Math.max(0, newPosition.x - 1);
            if (direction === "right") newPosition.x += 1;
            return { ...w, position: newPosition };
        }));
    };

    // Sort widgets by position for rendering
    const sortedWidgets = [...widgets].sort((a, b) => {
        if (a.position.y !== b.position.y) return a.position.y - b.position.y;
        return a.position.x - b.position.x;
    });

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                        Welcome back{currentWorkspace ? ` to ${currentWorkspace.name}` : ""}!
                    </h1>
                    <p className="text-neutral-600">
                        Here's what's happening in your workspace
                    </p>
                </div>

                {/* Widget Controls */}
                <div className="mb-6 flex items-center gap-3">
                    <Button
                        variant={isEditing ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        <Settings2 className="h-4 w-4 mr-2" />
                        {isEditing ? "Done Editing" : "Customize Dashboard"}
                    </Button>
                    {isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowWidgetPicker(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Widget
                        </Button>
                    )}
                </div>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedWidgets.map((widget) => (
                        <div
                            key={widget.id}
                            className={cn(
                                "transition-all",
                                widget.size === "small" && "md:col-span-1",
                                widget.size === "medium" && "md:col-span-1 lg:col-span-1",
                                widget.size === "large" && "md:col-span-2 lg:col-span-2"
                            )}
                        >
                            <WidgetRenderer
                                widget={widget}
                                isEditing={isEditing}
                                onRemove={() => handleRemoveWidget(widget.id)}
                                onMove={(direction) => handleMoveWidget(widget.id, direction)}
                            />
                        </div>
                    ))}
                </div>

                {widgets.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-neutral-400 mb-4">No widgets yet</div>
                        <Button onClick={() => setShowWidgetPicker(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Widget
                        </Button>
                    </div>
                )}
            </div>

            {/* Widget Picker Modal */}
            {showWidgetPicker && (
                <WidgetPicker
                    onSelect={handleAddWidget}
                    onClose={() => setShowWidgetPicker(false)}
                />
            )}
        </div>
    );
}
