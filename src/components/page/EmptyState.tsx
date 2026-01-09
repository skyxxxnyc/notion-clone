"use client";

import React from "react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Database, Import, Layout } from "lucide-react";

export function EmptyState() {
  const { createPage, createDatabase, setCurrentPage, currentWorkspaceId, workspaces, createWorkspace } = useAppStore();

  const handleCreatePage = async () => {
    // Ensure we have a workspace first
    if (!currentWorkspaceId) {
      const workspace = createWorkspace("My Workspace");
      // The createWorkspace function sets the current workspace
    }
    const newPage = await createPage(null);
    setCurrentPage(newPage.id);
  };

  const handleCreateDatabase = async () => {
    // Ensure we have a workspace first
    if (!currentWorkspaceId) {
      const workspace = createWorkspace("My Workspace");
    }
    const newDatabase = await createDatabase(null);
    setCurrentPage(newDatabase.id);
  };

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-900 flex items-center justify-center">
          <FileText className="h-8 w-8 text-neutral-400" />
        </div>

        <h2 className="text-2xl font-semibold text-neutral-200 mb-2">
          {currentWorkspace
            ? `Welcome to ${currentWorkspace.name}`
            : "Welcome to Notion Clone"}
        </h2>

        <p className="text-neutral-400 mb-8">
          Get started by creating your first page. You can add text, images,
          lists, and much more.
        </p>

        <div className="space-y-3">
          <Button onClick={handleCreatePage} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create a new page
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={handleCreatePage}>
              <FileText className="h-4 w-4 mr-2" />
              Empty page
            </Button>
            <Button variant="outline" className="w-full" onClick={handleCreateDatabase}>
              <Database className="h-4 w-4 mr-2" />
              Database
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#333]">
          <h3 className="text-sm font-medium text-neutral-400 mb-4">
            Templates
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "📝", name: "Meeting notes", desc: "Capture meeting details" },
              { icon: "✅", name: "To-do list", desc: "Track your tasks" },
              { icon: "📚", name: "Reading list", desc: "Books to read" },
              { icon: "🎯", name: "Goals", desc: "Set and track goals" },
            ].map((template) => (
              <button
                key={template.name}
                className="flex items-start gap-3 p-3 rounded-lg border border-[#333] hover:border-[#ccff00] hover:bg-neutral-900 transition-colors text-left group"
                onClick={handleCreatePage}
              >
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <div className="text-sm font-medium text-neutral-200 group-hover:text-[#ccff00]">
                    {template.name}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {template.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
