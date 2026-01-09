import React from "react";
import { useAppStore } from "@/store";
import { Star, FileText, Database } from "lucide-react";

export function FavoritesWidget() {
    const { pages, setCurrentPage, currentWorkspaceId } = useAppStore();

    const favoritePages = Object.values(pages)
        .filter(page => page.isFavourite && page.workspaceId === currentWorkspaceId && !page.isArchived)
        .slice(0, 8);

    if (favoritePages.length === 0) {
        return (
            <div className="text-center py-8">
                <Star className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No favorites yet</p>
                <p className="text-xs text-neutral-400 mt-1">
                    Star pages to see them here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {favoritePages.map((page) => (
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
                    </div>
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                </button>
            ))}
        </div>
    );
}
