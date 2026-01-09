import React from "react";
import { useAppStore } from "@/store";
import { Clock, FileText, Database, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeedWidget() {
    const { pages, currentWorkspaceId } = useAppStore();

    // Get recent activity (pages sorted by last edited)
    const recentActivity = Object.values(pages)
        .filter(page => page.workspaceId === currentWorkspaceId && !page.isArchived)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 8);

    if (recentActivity.length === 0) {
        return (
            <div className="text-center py-8">
                <Clock className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {recentActivity.map((page) => (
                <div key={page.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="p-1.5 bg-neutral-100 rounded-md">
                            <Edit className="h-3 w-3 text-neutral-500" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {page.icon ? (
                                <span className="text-sm">{page.icon}</span>
                            ) : page.isDatabase ? (
                                <Database className="h-3 w-3 text-neutral-400" />
                            ) : (
                                <FileText className="h-3 w-3 text-neutral-400" />
                            )}
                            <span className="font-medium text-sm text-neutral-900 truncate">
                                {page.title || "Untitled"}
                            </span>
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                            Edited {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
