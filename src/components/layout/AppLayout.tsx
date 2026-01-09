"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { PageView } from "@/components/page/PageView";
import { EmptyState } from "@/components/page/EmptyState";
import { QuickSearch } from "@/components/sidebar/QuickSearch";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthPage } from "@/components/auth/AuthPage";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const {
    sidebarOpen,
    currentPageId,
    currentWorkspaceId,
    currentUser,
    workspaces,
    createWorkspace,
  } = useAppStore();

  // Create default workspace if none exists (must be before any conditional returns)
  useEffect(() => {
    if (currentUser && workspaces.length === 0) {
      createWorkspace("My Workspace");
    }
  }, [currentUser, workspaces.length, createWorkspace]);

  // If no user is authenticated, show the auth page
  if (!currentUser) {
    return <AuthPage />;
  }

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
