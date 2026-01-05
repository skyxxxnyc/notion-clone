"use client";

import React from "react";
import type { Page, DatabaseRow, SelectOption } from "@/types";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BoardViewProps {
  page: Page;
  rows: DatabaseRow[];
  onAddRow: () => void;
}

// Default columns for board view
const DEFAULT_COLUMNS: SelectOption[] = [
  { id: "1", name: "Not started", color: "#e5e5e5" },
  { id: "2", name: "In progress", color: "#fef3c7" },
  { id: "3", name: "Done", color: "#dcfce7" },
];

export function BoardView({ page, rows, onAddRow }: BoardViewProps) {
  const { updateDatabaseRow, deleteDatabaseRow, createDatabaseRow } = useAppStore();

  // Get status property and its options
  const statusProperty = page.databaseConfig?.properties.find(
    (p) => p.type === "select" && p.name.toLowerCase() === "status"
  );
  const columns = statusProperty?.options || DEFAULT_COLUMNS;

  // Group rows by status
  const groupedRows: Record<string, DatabaseRow[]> = {};
  columns.forEach((col) => {
    groupedRows[col.id] = [];
  });
  groupedRows["uncategorised"] = [];

  rows.forEach((row) => {
    const statusId = row.properties["status"] as string;
    if (statusId && groupedRows[statusId]) {
      groupedRows[statusId].push(row);
    } else {
      groupedRows["uncategorised"].push(row);
    }
  });

  const handleMoveCard = (rowId: string, newStatusId: string) => {
    updateDatabaseRow(page.id, rowId, {
      properties: {
        ...rows.find((r) => r.id === rowId)?.properties,
        status: newStatusId,
      },
    });
  };

  const handleAddToColumn = (statusId: string) => {
    const newRow = createDatabaseRow(page.id);
    updateDatabaseRow(page.id, newRow.id, {
      properties: { status: statusId },
    });
  };

  const handleDeleteCard = (rowId: string) => {
    if (window.confirm("Delete this card?")) {
      deleteDatabaseRow(page.id, rowId);
    }
  };

  return (
    <div className="flex gap-3 p-4 overflow-x-auto min-h-[500px]">
      {/* Uncategorised column */}
      {groupedRows["uncategorised"].length > 0 && (
        <BoardColumn
          id="uncategorised"
          name="No Status"
          color="#f5f5f5"
          rows={groupedRows["uncategorised"]}
          page={page}
          onAddCard={() => handleAddToColumn("")}
          onMoveCard={handleMoveCard}
          onDeleteCard={handleDeleteCard}
          allColumns={columns}
        />
      )}

      {/* Status columns */}
      {columns.map((column) => (
        <BoardColumn
          key={column.id}
          id={column.id}
          name={column.name}
          color={column.color}
          rows={groupedRows[column.id] || []}
          page={page}
          onAddCard={() => handleAddToColumn(column.id)}
          onMoveCard={handleMoveCard}
          onDeleteCard={handleDeleteCard}
          allColumns={columns}
        />
      ))}

      {/* Add column button */}
      <div className="flex-shrink-0 w-72">
        <Button variant="ghost" className="w-full text-neutral-500">
          <Plus className="h-4 w-4 mr-1" />
          Add group
        </Button>
      </div>
    </div>
  );
}

interface BoardColumnProps {
  id: string;
  name: string;
  color: string;
  rows: DatabaseRow[];
  page: Page;
  onAddCard: () => void;
  onMoveCard: (rowId: string, newStatusId: string) => void;
  onDeleteCard: (rowId: string) => void;
  allColumns: SelectOption[];
}

function BoardColumn({
  id,
  name,
  color,
  rows,
  page,
  onAddCard,
  onMoveCard,
  onDeleteCard,
  allColumns,
}: BoardColumnProps) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-neutral-100 rounded-lg">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-neutral-700">{name}</span>
          <span className="text-xs text-neutral-500">{rows.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onAddCard}
            className="text-neutral-500"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="iconSm" className="text-neutral-500">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Hide</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 px-2 pb-2">
        <div className="space-y-2">
          {rows.map((row) => (
            <BoardCard
              key={row.id}
              row={row}
              page={page}
              onMove={onMoveCard}
              onDelete={onDeleteCard}
              allColumns={allColumns}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Add Card Button */}
      <div className="px-2 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddCard}
          className="w-full text-neutral-500 justify-start"
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>
    </div>
  );
}

interface BoardCardProps {
  row: DatabaseRow;
  page: Page;
  onMove: (rowId: string, newStatusId: string) => void;
  onDelete: (rowId: string) => void;
  allColumns: SelectOption[];
}

function BoardCard({ row, page, onMove, onDelete, allColumns }: BoardCardProps) {
  const title = (row.properties["title"] as string) || "Untitled";
  const tags = row.properties["tags"] as string[] | undefined;
  const tagsProperty = page.databaseConfig?.properties.find((p) => p.id === "tags");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-3 cursor-pointer hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium text-neutral-900">{title}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="iconSm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Open</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            {allColumns.map((col) => (
              <DropdownMenuItem
                key={col.id}
                onClick={() => onMove(row.id, col.id)}
              >
                Move to {col.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(row.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tagId) => {
            const tag = tagsProperty?.options?.find((o) => o.id === tagId);
            return tag ? (
              <span
                key={tagId}
                className="inline-block px-2 py-0.5 rounded text-xs"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Date */}
      {row.properties["date"] && (
        <div className="text-xs text-neutral-500 mt-2">
          {new Date(row.properties["date"] as string).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
