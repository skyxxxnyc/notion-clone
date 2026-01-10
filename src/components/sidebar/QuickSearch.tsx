"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  FileText,
  Clock,
  Star,
  ArrowRight,
  Hash,
} from "lucide-react";

export function QuickSearch() {
  const {
    searchOpen,
    setSearchOpen,
    pages,
    currentWorkspaceId,
    setCurrentPage,
  } = useAppStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get searchable pages
  const allPages = useMemo(() => {
    return Object.values(pages).filter(
      (page) =>
        page.workspaceId === currentWorkspaceId && !page.isArchived
    );
  }, [pages, currentWorkspaceId]);

  // Recent pages (last 5 modified)
  const recentPages = useMemo(() => {
    return [...allPages]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);
  }, [allPages]);

  // Favourite pages
  const favouritePages = useMemo(() => {
    return allPages.filter((page) => page.isFavourite);
  }, [allPages]);

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchQuery = query.toLowerCase();
    return allPages
      .filter((page) => {
        const titleMatch = page.title.toLowerCase().includes(searchQuery);
        // Could also search content here
        return titleMatch;
      })
      .slice(0, 10);
  }, [query, allPages]);

  const displayItems = query.trim()
    ? searchResults
    : [...recentPages];

  const handleSelect = (pageId: string) => {
    setCurrentPage(pageId);
    setSearchOpen(false);
    setQuery("");
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev >= displayItems.length - 1 ? 0 : prev + 1
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev <= 0 ? displayItems.length - 1 : prev - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (displayItems[selectedIndex]) {
            handleSelect(displayItems[selectedIndex].id);
          }
          break;
        case "Escape":
          e.preventDefault();
          setSearchOpen(false);
          break;
      }
    },
    [displayItems, selectedIndex, setSearchOpen]
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "p")) {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [searchOpen, setSearchOpen]);

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="p-0 max-w-xl">
        <DialogTitle className="sr-only">Quick Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search for pages and navigate quickly.
        </DialogDescription>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <Search className="h-5 w-5 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            className="border-0 p-0 text-lg focus-visible:ring-0 shadow-none text-neutral-200 placeholder:text-neutral-500"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-96">
          <div className="py-2">
            {!query.trim() && recentPages.length > 0 && (
              <div className="px-2 mb-2">
                <div className="px-2 py-1 text-xs font-medium text-neutral-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent
                </div>
              </div>
            )}

            {displayItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-neutral-500">
                {query.trim()
                  ? "No results found"
                  : "No recent pages"}
              </div>
            ) : (
              displayItems.map((page, index) => (
                <button
                  key={page.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-900 transition-colors",
                    index === selectedIndex && "bg-neutral-900"
                  )}
                  onClick={() => handleSelect(page.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex-shrink-0">
                    {page.icon ? (
                      <span className="text-lg">{page.icon}</span>
                    ) : (
                      <FileText className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-200 truncate">
                      {page.title || "Untitled"}
                    </div>
                    {page.parentId && pages[page.parentId] && (
                      <div className="text-xs text-neutral-500 truncate flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        {pages[page.parentId].title || "Untitled"}
                      </div>
                    )}
                  </div>
                  {page.isFavourite && (
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="px-4 py-2 border-t border-neutral-800 text-xs text-neutral-500 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">↑↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">↵</kbd>
            to select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">esc</kbd>
            to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
