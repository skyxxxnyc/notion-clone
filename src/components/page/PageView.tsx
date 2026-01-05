"use client";

import React, { useState, useCallback } from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { PageHeader } from "./PageHeader";
import { PageBreadcrumb } from "./PageBreadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Clock,
  Star,
  MoreHorizontal,
  Share,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PageViewProps {
  pageId: string;
}

export function PageView({ pageId }: PageViewProps) {
  const {
    pages,
    updatePage,
    toggleFavourite,
    duplicatePage,
    deletePage,
    setCurrentPage,
  } = useAppStore();

  const page = pages[pageId];
  const [editorContent, setEditorContent] = useState(
    page?.blocks
      .map((block) => {
        // Convert blocks to HTML for the editor
        switch (block.type) {
          case "heading1":
            return `<h1>${block.content}</h1>`;
          case "heading2":
            return `<h2>${block.content}</h2>`;
          case "heading3":
            return `<h3>${block.content}</h3>`;
          case "bulletList":
            return `<ul><li>${block.content}</li></ul>`;
          case "numberedList":
            return `<ol><li>${block.content}</li></ol>`;
          case "quote":
            return `<blockquote>${block.content}</blockquote>`;
          case "code":
            return `<pre><code>${block.content}</code></pre>`;
          default:
            return `<p>${block.content}</p>`;
        }
      })
      .join("") || "<p></p>"
  );

  const handleContentChange = useCallback(
    (content: string) => {
      setEditorContent(content);
      // Could debounce this and sync back to store
    },
    []
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      updatePage(pageId, { title });
    },
    [pageId, updatePage]
  );

  const handleIconChange = useCallback(
    (icon: string) => {
      updatePage(pageId, { icon });
    },
    [pageId, updatePage]
  );

  const handleCoverChange = useCallback(
    (coverImage: string | undefined) => {
      updatePage(pageId, { coverImage });
    },
    [pageId, updatePage]
  );

  const handleDuplicate = () => {
    const newPage = duplicatePage(pageId);
    setCurrentPage(newPage.id);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      deletePage(pageId);
    }
  };

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-500">Page not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-white">
        <PageBreadcrumb pageId={pageId} />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-500"
          >
            Share
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => toggleFavourite(pageId)}
            title={page.isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            <Star
              className={cn(
                "h-4 w-4",
                page.isFavourite && "fill-yellow-400 text-yellow-400"
              )}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="iconSm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDuplicate}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Page history</DropdownMenuItem>
              <DropdownMenuItem>Page analytics</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Page Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-16 py-12">
          <PageHeader
            page={page}
            onTitleChange={handleTitleChange}
            onIconChange={handleIconChange}
            onCoverChange={handleCoverChange}
          />

          <div className="mt-8">
            <BlockEditor
              content={editorContent}
              onChange={handleContentChange}
              pageId={pageId}
              placeholder="Press '/' for commands, or just start typing..."
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
