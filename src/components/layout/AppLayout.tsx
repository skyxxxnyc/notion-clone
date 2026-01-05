"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { PageView } from "@/components/page/PageView";
import { EmptyState } from "@/components/page/EmptyState";
import { QuickSearch } from "@/components/sidebar/QuickSearch";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const {
    sidebarOpen,
    sidebarWidth,
    currentPageId,
    currentWorkspaceId,
    workspaces,
    createWorkspace,
    setCurrentUser,
  } = useAppStore();

  // Initialize default workspace and user on first load
  useEffect(() => {
    // Set default user
    setCurrentUser({
      id: "user-1",
      name: "You",
      email: "you@example.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create default workspace if none exists
    if (workspaces.length === 0) {
      createWorkspace("My Workspace");
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-white overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 flex flex-col overflow-hidden transition-all duration-200",
            sidebarOpen && `ml-0`
          )}
        >
          {currentPageId ? (
            <PageView pageId={currentPageId} />
          ) : (
            <EmptyState />
          )}
        </main>

        {/* Modals */}
        <QuickSearch />
        <SettingsDialog />
      </div>
    </TooltipProvider>
  );
}
