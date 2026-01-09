import React from "react";
import { useAppStore } from "@/store";
import { Clock, FileText, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function RecentPagesWidget() {
    const { pages, setCurrentPage, currentWorkspaceId } = useAppStore();

    const recentPages = Object.values(pages)
        .filter(page => page.workspaceId === currentWorkspaceId && !page.isArchived)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    if (recentPages.length === 0) {
        return (
            <div className="text-center py-8">
                <Clock className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No recent pages</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {recentPages.map((page) => (
                <button
                    key={page.id}
                    onClick={() => setCurrentPage(page.id)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-md transition-colors text-left"
                >
                    <div className="flex-shrink-0">
                        {page.icon ? (
                            <span className="text-lg">{page.icon}</span>
                        ) : page.isDatabase ? (
                            <Database className="h-4 w-4 text-neutral-400" />
                        ) : (
                            <FileText className="h-4 w-4 text-neutral-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-neutral-900 truncate">
                            {page.title || "Untitled"}
                        </div>
                        <div className="text-xs text-neutral-500">
                            Edited {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
