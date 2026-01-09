import React from "react";
import { Widget } from "@/types/widgets";
import { RecentPagesWidget } from "./widgets/RecentPagesWidget";
import { FavoritesWidget } from "./widgets/FavoritesWidget";
import { QuickActionsWidget } from "./widgets/QuickActionsWidget";
import { WorkspaceStatsWidget } from "./widgets/WorkspaceStatsWidget";
import { CalendarWidget } from "./widgets/CalendarWidget";
import { TaskSummaryWidget } from "./widgets/TaskSummaryWidget";
import { ActivityFeedWidget } from "./widgets/ActivityFeedWidget";
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetRendererProps {
    widget: Widget;
    isEditing?: boolean;
    onRemove?: () => void;
    onMove?: (direction: "up" | "down" | "left" | "right") => void;
}

export function WidgetRenderer({ widget, isEditing, onRemove, onMove }: WidgetRendererProps) {
    const renderWidget = () => {
        switch (widget.type) {
            case "recent_pages":
                return <RecentPagesWidget />;
            case "favorites":
                return <FavoritesWidget />;
            case "quick_actions":
                return <QuickActionsWidget />;
            case "workspace_stats":
                return <WorkspaceStatsWidget />;
            case "calendar":
                return <CalendarWidget />;
            case "task_summary":
                return <TaskSummaryWidget />;
            case "activity_feed":
                return <ActivityFeedWidget />;
            default:
                return (
                    <div className="text-sm text-neutral-500">
                        Unknown widget type: {widget.type}
                    </div>
                );
        }
    };

    return (
        <div className={cn(
            "relative group",
            isEditing && "ring-2 ring-blue-200 rounded-lg"
        )}>
            {isEditing && (
                <div className="absolute -top-2 -right-2 z-10 flex gap-1">
                    {onMove && (
                        <>
                            <button
                                onClick={() => onMove("up")}
                                className="p-1 bg-white border border-neutral-200 rounded shadow-sm hover:bg-neutral-50"
                                title="Move up"
                            >
                                <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                                onClick={() => onMove("down")}
                                className="p-1 bg-white border border-neutral-200 rounded shadow-sm hover:bg-neutral-50"
                                title="Move down"
                            >
                                <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                                onClick={() => onMove("left")}
                                className="p-1 bg-white border border-neutral-200 rounded shadow-sm hover:bg-neutral-50"
                                title="Move left"
                            >
                                <ArrowLeft className="h-3 w-3" />
                            </button>
                            <button
                                onClick={() => onMove("right")}
                                className="p-1 bg-white border border-neutral-200 rounded shadow-sm hover:bg-neutral-50"
                                title="Move right"
                            >
                                <ArrowRight className="h-3 w-3" />
                            </button>
                        </>
                    )}
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="p-1 bg-white border border-red-200 text-red-600 rounded shadow-sm hover:bg-red-50"
                            title="Remove widget"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                <h3 className="font-semibold text-neutral-900 mb-4">{widget.title}</h3>
                {renderWidget()}
            </div>
        </div>
    );
}
