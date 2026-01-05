"use client";

import React from "react";
import type { Page, DatabaseRow } from "@/types";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { Plus, MoreHorizontal, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GalleryViewProps {
  page: Page;
  rows: DatabaseRow[];
  onAddRow: () => void;
}

export function GalleryView({ page, rows, onAddRow }: GalleryViewProps) {
  const { deleteDatabaseRow } = useAppStore();

  const handleDeleteCard = (rowId: string) => {
    if (window.confirm("Delete this card?")) {
      deleteDatabaseRow(page.id, rowId);
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rows.map((row) => (
          <GalleryCard
            key={row.id}
            row={row}
            page={page}
            onDelete={() => handleDeleteCard(row.id)}
          />
        ))}

        {/* Add Card */}
        <button
          onClick={onAddRow}
          className="aspect-[4/3] border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-neutral-500 hover:border-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <Plus className="h-8 w-8 mb-2" />
          <span className="text-sm">New</span>
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

interface GalleryCardProps {
  row: DatabaseRow;
  page: Page;
  onDelete: () => void;
}

function GalleryCard({ row, page, onDelete }: GalleryCardProps) {
  const title = (row.properties["title"] as string) || "Untitled";
  const coverImage = row.properties["cover"] as string | undefined;
  const statusId = row.properties["status"] as string | undefined;
  const statusProperty = page.databaseConfig?.properties.find(
    (p) => p.id === "status"
  );
  const status = statusProperty?.options?.find((o) => o.id === statusId);

  return (
    <div className="group relative bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      {/* Cover/Preview */}
      <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileText className="h-12 w-12 text-neutral-300" />
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-neutral-900 truncate flex-1">
            {title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="iconSm"
                className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1"
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
        </div>

        {/* Status Badge */}
        {status && (
          <div className="mt-2">
            <span
              className="inline-block px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: status.color }}
            >
              {status.name}
            </span>
          </div>
        )}

        {/* Date */}
        {row.properties["date"] && (
          <div className="mt-2 text-xs text-neutral-500">
            {new Date(row.properties["date"] as string).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
