"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Plus,
  Settings,
  Users,
  Trash2,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WorkspaceSwitcher() {
  const {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useAppStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const workspace = createWorkspace(newWorkspaceName.trim());
      setCurrentWorkspace(workspace.id);
      setNewWorkspaceName("");
      setIsCreateOpen(false);
    }
  };

  const handleDeleteWorkspace = (id: string) => {
    if (
      workspaces.length > 1 &&
      window.confirm("Are you sure you want to delete this workspace?")
    ) {
      deleteWorkspace(id);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-200/50 transition-colors">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
              {currentWorkspace?.icon ||
                currentWorkspace?.name?.charAt(0).toUpperCase() ||
                "W"}
            </div>
            <span className="text-sm font-medium text-neutral-700 max-w-32 truncate">
              {currentWorkspace?.name || "Workspace"}
            </span>
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <div className="px-2 py-1.5 text-xs text-neutral-500">
            Your workspaces
          </div>

          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setCurrentWorkspace(workspace.id)}
            >
              <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                {workspace.icon || workspace.name.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 truncate">{workspace.name}</span>
              {workspace.id === currentWorkspaceId && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
            <DialogDescription>
              A workspace is a shared environment where you can collaborate on
              pages with your team.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateWorkspace();
                }
              }}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
