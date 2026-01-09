"use client";

import React from "react";
import { useAppStore } from "@/store";
import type { Page } from "@/types";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  FileText,
  Plus,
  MoreHorizontal,
  Star,
  Copy,
  Trash2,
  ExternalLink,
  Table,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface PageTreeItemProps {
  page: Page;
  level: number;
}

export function PageTreeItem({ page, level }: PageTreeItemProps) {
  const {
    pages,
    currentPageId,
    expandedPageIds,
    setCurrentPage,
    togglePageExpanded,
    createPage,
    updatePage,
    deletePage,
    duplicatePage,
    toggleFavourite,
    archivePage,
  } = useAppStore();

  const isExpanded = expandedPageIds.has(page.id);
  const isActive = currentPageId === page.id;
  const hasChildren = page.children.length > 0;

  const childPages = page.children
    .map((id) => pages[id])
    .filter((p) => p && !p.isArchived);

  const handleClick = () => {
    setCurrentPage(page.id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePageExpanded(page.id);
  };

  const handleAddSubpage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newPage = await createPage(page.id);
    setCurrentPage(newPage.id);
    if (!isExpanded) {
      togglePageExpanded(page.id);
    }
  };

  const handleDuplicate = async () => {
    const newPage = await duplicatePage(page.id);
    setCurrentPage(newPage.id);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      await deletePage(page.id);
    }
  };

  const handleArchive = () => {
    archivePage(page.id);
  };

  const handleToggleFavourite = () => {
    toggleFavourite(page.id);
  };

  const pageIcon = page.icon || (page.isDatabase ? <Table className="h-4 w-4 text-neutral-400" /> : <FileText className="h-4 w-4 text-neutral-400" />);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div>
          <div
            className={cn(
              "group flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors",
              isActive
                ? "bg-neutral-800"
                : "hover:bg-neutral-900"
            )}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={handleClick}
          >
            <button
              className={cn(
                "p-0.5 rounded hover:bg-neutral-800 transition-colors",
                !hasChildren && "invisible"
              )}
              onClick={handleToggleExpand}
            >
              <ChevronRight
                className={cn(
                  "h-3 w-3 text-neutral-400 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </button>

            <span className="flex-shrink-0 text-lg">
              {typeof pageIcon === "string" ? pageIcon : pageIcon}
            </span>

            <span className="flex-1 text-sm text-neutral-200 truncate">
              {page.title || "Untitled"}
            </span>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="p-1 rounded hover:bg-neutral-800 transition-colors"
                onClick={handleAddSubpage}
                title="Add subpage"
              >
                <Plus className="h-3 w-3 text-neutral-400" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 rounded hover:bg-neutral-800 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    title="More options"
                  >
                    <MoreHorizontal className="h-3 w-3 text-neutral-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={handleToggleFavourite}>
                    <Star
                      className={cn(
                        "h-4 w-4 mr-2",
                        page.isFavourite && "fill-yellow-400 text-yellow-400"
                      )}
                    />
                    {page.isFavourite
                      ? "Remove from favourites"
                      : "Add to favourites"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleAddSubpage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add subpage
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Children */}
          {isExpanded && childPages.length > 0 && (
            <div>
              {childPages.map((childPage) => (
                <PageTreeItem
                  key={childPage.id}
                  page={childPage}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleToggleFavourite}>
          <Star
            className={cn(
              "h-4 w-4 mr-2",
              page.isFavourite && "fill-yellow-400 text-yellow-400"
            )}
          />
          {page.isFavourite ? "Remove from favourites" : "Add to favourites"}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleAddSubpage}>
          <Plus className="h-4 w-4 mr-2" />
          Add subpage
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
