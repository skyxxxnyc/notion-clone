"use client";

import React from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { ChevronRight, FileText } from "lucide-react";

interface PageBreadcrumbProps {
  pageId: string;
}

export function PageBreadcrumb({ pageId }: PageBreadcrumbProps) {
  const { pages, setCurrentPage, workspaces, currentWorkspaceId } = useAppStore();

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  // Build breadcrumb path
  const buildPath = (id: string): string[] => {
    const page = pages[id];
    if (!page) return [];
    if (!page.parentId) return [id];
    return [...buildPath(page.parentId), id];
  };

  const path = buildPath(pageId);

  return (
    <nav className="flex items-center gap-1 text-sm">
      {/* Workspace Home - Always first */}
      <button
        onClick={() => setCurrentPage(null)}
        className="flex items-center gap-1.5 px-1.5 py-0.5 rounded max-w-40 truncate text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
      >
        <div className="w-4 h-4 rounded-none bg-[#ccff00] border border-black flex items-center justify-center text-black text-[10px] font-bold font-mono flex-shrink-0">
          {currentWorkspace?.icon || currentWorkspace?.name?.charAt(0).toUpperCase() || "W"}
        </div>
        <span className="truncate">{currentWorkspace?.name || "Workspace"}</span>
      </button>

      {/* Page Path */}
      {path.map((id, index) => {
        const page = pages[id];
        if (!page) return null;

        const isLast = index === path.length - 1;

        return (
          <React.Fragment key={id}>
            <ChevronRight className="h-3 w-3 text-neutral-500 flex-shrink-0" />
            <button
              onClick={() => !isLast && setCurrentPage(id)}
              className={cn(
                "flex items-center gap-1.5 px-1.5 py-0.5 rounded max-w-40 truncate",
                isLast
                  ? "text-neutral-100 font-medium"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
              )}
            >
              {page.icon ? (
                <span className="text-sm flex-shrink-0">{page.icon}</span>
              ) : (
                <FileText className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
              )}
              <span className="truncate">{page.title || "Untitled"}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
