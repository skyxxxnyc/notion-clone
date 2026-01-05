"use client";

import React from "react";
import type { Page, DatabaseRow } from "@/types";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { Plus, FileText, MoreHorizontal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ListViewProps {
  page: Page;
  rows: DatabaseRow[];
  onAddRow: () => void;
}

export function ListView({ page, rows, onAddRow }: ListViewProps) {
  const { deleteDatabaseRow } = useAppStore();

  const handleDeleteRow = (rowId: string) => {
    if (window.confirm("Delete this item?")) {
      deleteDatabaseRow(page.id, rowId);
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-1">
        {rows.map((row) => (
          <ListItem
            key={row.id}
            row={row}
            page={page}
            onDelete={() => handleDeleteRow(row.id)}
          />
        ))}

        {/* Add Row */}
        <button
          onClick={onAddRow}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100 rounded transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New</span>
        </button>
      </div>

      {rows.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          <p className="mb-4">No items yet</p>
          <Button onClick={onAddRow}>
            <Plus className="h-4 w-4 mr-2" />
            Add item
          </Button>
        </div>
      )}
    </div>
  );
}

interface ListItemProps {
  row: DatabaseRow;
  page: Page;
  onDelete: () => void;
}

function ListItem({ row, page, onDelete }: ListItemProps) {
  const title = (row.properties["title"] as string) || "Untitled";
  const statusId = row.properties["status"] as string | undefined;
  const statusProperty = page.databaseConfig?.properties.find(
    (p) => p.id === "status"
  );
  const status = statusProperty?.options?.find((o) => o.id === statusId);
  const date = row.properties["date"] as string | undefined;

  return (
    <div className="group flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 rounded cursor-pointer transition-colors">
      {/* Icon */}
      <FileText className="h-4 w-4 text-neutral-400 flex-shrink-0" />

      {/* Title */}
      <span className="flex-1 text-sm text-neutral-900 truncate">{title}</span>

      {/* Status */}
      {status && (
        <span
          className="px-2 py-0.5 rounded text-xs flex-shrink-0"
          style={{ backgroundColor: status.color }}
        >
          {status.name}
        </span>
      )}

      {/* Date */}
      {date && (
        <span className="text-xs text-neutral-500 flex-shrink-0">
          {new Date(date).toLocaleDateString()}
        </span>
      )}

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="iconSm"
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Open</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onClick={onDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChevronRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
    </div>
  );
}
