import React from "react";
import { X, Clock, Star, Zap, Calendar, CheckSquare, BarChart3, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetPickerProps {
    onSelect: (widget: any) => void;
    onClose: () => void;
}

export function WidgetPicker({ onSelect, onClose }: WidgetPickerProps) {
    const widgetTypes = [
        {
            type: "recent_pages",
            title: "Recent Pages",
            description: "Quick access to your recently edited pages",
            icon: Clock,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            size: "medium" as const
        },
        {
            type: "favorites",
            title: "Favorites",
            description: "Pages you've starred for quick access",
            icon: Star,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            size: "medium" as const
        },
        {
            type: "quick_actions",
            title: "Quick Actions",
            description: "Fast shortcuts to common actions",
            icon: Zap,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            size: "medium" as const
        },
        {
            type: "calendar",
            title: "Calendar",
            description: "Month view calendar",
            icon: Calendar,
            color: "text-green-600",
            bgColor: "bg-green-50",
            size: "medium" as const
        },
        {
            type: "task_summary",
            title: "Task Summary",
            description: "Overview of tasks across your databases",
            icon: CheckSquare,
            color: "text-red-600",
            bgColor: "bg-red-50",
            size: "medium" as const
        },
        {
            type: "workspace_stats",
            title: "Workspace Stats",
            description: "Statistics about your workspace",
            icon: BarChart3,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            size: "small" as const
        },
        {
            type: "activity_feed",
            title: "Activity Feed",
            description: "Recent changes and updates",
            icon: Activity,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            size: "medium" as const
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-900">Add Widget</h2>
                        <p className="text-sm text-neutral-500 mt-1">
                            Choose a widget to add to your dashboard
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {widgetTypes.map((widget) => {
                        const Icon = widget.icon;
                        return (
                            <button
                                key={widget.type}
                                onClick={() => onSelect({
                                    type: widget.type,
                                    title: widget.title,
                                    size: widget.size,
                                    position: { x: 0, y: 0 }
                                })}
                                className="group text-left border border-neutral-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${widget.bgColor}`}>
                                        <Icon className={`h-6 w-6 ${widget.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-blue-600 transition-colors">
                                            {widget.title}
                                        </h3>
                                        <p className="text-sm text-neutral-600">
                                            {widget.description}
                                        </p>
                                        <div className="mt-2">
                                            <span className="inline-block px-2 py-0.5 bg-neutral-100 text-xs text-neutral-600 rounded">
                                                {widget.size}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="px-6 py-4 border-t border-neutral-200 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
