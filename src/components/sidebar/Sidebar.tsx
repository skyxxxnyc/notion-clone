"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  Plus,
  Home,
  Star,
  Trash2,
  FileText,
  MoreHorizontal,
  Table,
  Upload,
} from "lucide-react";
import { PageTreeItem } from "./PageTreeItem";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { QuickSearch } from "./QuickSearch";
import { ImportModal } from "../import/ImportModal";
import { TemplateBrowser } from "../templates/TemplateBrowser";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const {
    sidebarOpen,
    sidebarWidth,
    toggleSidebar,
    setSidebarWidth,
    pages,
    currentWorkspaceId,
    createPage,
    createDatabase,
    setCurrentPage,
    setSearchOpen,
    setSettingsOpen,
  } = useAppStore();

  const [isResizing, setIsResizing] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [templateBrowserOpen, setTemplateBrowserOpen] = useState(false);

  // Get root pages (no parent)
  const rootPages = Object.values(pages).filter(
    (page) =>
      page.parentId === null &&
      page.workspaceId === currentWorkspaceId &&
      !page.isArchived
  );

  // Get favourite pages
  const favouritePages = Object.values(pages).filter(
    (page) =>
      page.isFavourite &&
      page.workspaceId === currentWorkspaceId &&
      !page.isArchived
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (e: MouseEvent) => {
      setSidebarWidth(e.clientX);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleNewPage = async () => {
    const newPage = await createPage(null);
    setCurrentPage(newPage.id);
  };

  const handleNewDatabase = async () => {
    const newDatabase = await createDatabase(null);
    setCurrentPage(newDatabase.id);
  };

  if (!sidebarOpen) {
    return (
      <div className="fixed left-0 top-0 z-40 h-full">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-2"
          onClick={toggleSidebar}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[#0a0a0a] border-r border-[#333] relative",
        isResizing && "select-none",
        className
      )}
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-[#333]">
        <WorkspaceSwitcher />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setSearchOpen(true)}
            title="Search"
            className="text-neutral-400 hover:text-neutral-200"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={toggleSidebar}
            title="Close sidebar"
            className="text-neutral-400 hover:text-neutral-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 space-y-0.5">
        <button
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span>Quick Search</span>
          <span className="ml-auto text-xs text-neutral-500">⌘K</span>
        </button>
        <button
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
        <button
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          onClick={handleNewPage}
        >
          <Plus className="h-4 w-4" />
          <span>New Page</span>
        </button>
        <button
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          onClick={handleNewDatabase}
        >
          <Table className="h-4 w-4" />
          <span>New Database</span>
        </button>
        <button
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          onClick={() => setImportOpen(true)}
        >
          <Upload className="h-4 w-4" />
          <span>Import</span>
        </button>
        <button
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          onClick={() => setTemplateBrowserOpen(true)}
        >
          <FileText className="h-4 w-4" />
          <span>Templates</span>
        </button>
      </div>

      {/* Favourites */}
      {favouritePages.length > 0 && (
        <div className="px-2 py-1">
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-500 uppercase">
            <Star className="h-3 w-3" />
            <span>Favourites</span>
          </div>
          <div className="space-y-0.5">
            {favouritePages.map((page) => (
              <PageTreeItem key={page.id} page={page} level={0} />
            ))}
          </div>
        </div>
      )}

      {/* Pages */}
      <ScrollArea className="flex-1 px-2 py-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-neutral-500 uppercase">
            Pages
          </span>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={handleNewPage}
            title="Add page"
            className="text-neutral-400 hover:text-neutral-200"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-0.5">
          {rootPages.length === 0 ? (
            <div className="px-2 py-4 text-center">
              <p className="text-sm text-neutral-500">No pages yet</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewPage}
                className="mt-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create a page
              </Button>
            </div>
          ) : (
            rootPages.map((page) => (
              <PageTreeItem key={page.id} page={page} level={0} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-[#333]">
        <button
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors"
          onClick={handleNewPage}
        >
          <Plus className="h-4 w-4" />
          <span>New page</span>
        </button>
      </div>

      {/* Resize Handle */}
      <div
        className={cn(
          "absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-[#333] transition-colors",
          isResizing && "bg-[#333]"
        )}
        onMouseDown={handleMouseDown}
      />
      <ImportModal open={importOpen} onOpenChange={setImportOpen} />
      {templateBrowserOpen && currentWorkspaceId && (
        <TemplateBrowser
          onClose={() => setTemplateBrowserOpen(false)}
          workspaceId={currentWorkspaceId}
        />
      )}
    </div>
  );
}
