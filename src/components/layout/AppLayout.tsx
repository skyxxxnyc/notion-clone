"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { PageView } from "@/components/page/PageView";
import { PremiumPageView } from "@/components/page/PremiumPageView";
import { EmptyState } from "@/components/page/EmptyState";
import { QuickSearch } from "@/components/sidebar/QuickSearch";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthPage } from "@/components/auth/AuthPage";
import { cn } from "@/lib/utils";
import PremiumDashboard from "@/components/dashboard/PremiumDashboard";

export function AppLayout() {
  const {
    sidebarOpen,
    toggleSidebar,
    currentPageId,
    currentWorkspaceId,
    currentUser,
    workspaces,
    createWorkspace,
    setSettingsOpen,
  } = useAppStore();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Sidebar: Cmd/Ctrl + \
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }

      // Open Settings: Cmd/Ctrl + ,
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, setSettingsOpen]);

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
            <PremiumDashboard />
          )}
        </main>

        {/* Modals */}
        <QuickSearch />
        <SettingsDialog />
      </div>
    </TooltipProvider>
  );
}
