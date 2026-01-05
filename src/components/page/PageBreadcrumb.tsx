"use client";

import React from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { ChevronRight, FileText } from "lucide-react";

interface PageBreadcrumbProps {
  pageId: string;
}

export function PageBreadcrumb({ pageId }: PageBreadcrumbProps) {
  const { pages, setCurrentPage } = useAppStore();

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
      {path.map((id, index) => {
        const page = pages[id];
        if (!page) return null;

        const isLast = index === path.length - 1;

        return (
          <React.Fragment key={id}>
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-neutral-400 flex-shrink-0" />
            )}
            <button
              onClick={() => !isLast && setCurrentPage(id)}
              className={cn(
                "flex items-center gap-1.5 px-1.5 py-0.5 rounded max-w-40 truncate",
                isLast
                  ? "text-neutral-700 font-medium"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
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
