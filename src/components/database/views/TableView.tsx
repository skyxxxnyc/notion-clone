"use client";

import React, { useState } from "react";
import type { Page, DatabaseRow, DatabaseProperty } from "@/types";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { Plus, GripVertical, MoreHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableViewProps {
  page: Page;
  rows: DatabaseRow[];
  onAddRow: () => void;
}

// Default properties for a new database
const DEFAULT_PROPERTIES: DatabaseProperty[] = [
  { id: "title", name: "Name", type: "title", isVisible: true, width: 250 },
  { id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
    { id: "1", name: "Not started", color: "#e5e5e5" },
    { id: "2", name: "In progress", color: "#fef3c7" },
    { id: "3", name: "Done", color: "#dcfce7" },
  ]},
  { id: "date", name: "Date", type: "date", isVisible: true, width: 120 },
  { id: "tags", name: "Tags", type: "multiSelect", isVisible: true, width: 150, options: [
    { id: "1", name: "Important", color: "#fee2e2" },
    { id: "2", name: "Work", color: "#dbeafe" },
    { id: "3", name: "Personal", color: "#dcfce7" },
  ]},
];

export function TableView({ page, rows, onAddRow }: TableViewProps) {
  const { updateDatabaseRow, deleteDatabaseRow } = useAppStore();
  const properties = page.databaseConfig?.properties || DEFAULT_PROPERTIES;

  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    propertyId: string;
  } | null>(null);

  const handleCellChange = (
    rowId: string,
    propertyId: string,
    value: unknown
  ) => {
    const currentRow = rows.find((r) => r.id === rowId);
    const updatedProperties = {
      ...currentRow?.properties,
      [propertyId]: value,
    } as Record<string, import("@/types").PropertyValue>;

    updateDatabaseRow(page.id, rowId, {
      properties: updatedProperties,
    });
  };

  const handleDeleteRow = (rowId: string) => {
    if (window.confirm("Delete this row?")) {
      deleteDatabaseRow(page.id, rowId);
    }
  };

  return (
    <div className="w-full">
      {/* Header Row */}
      <div className="flex border-b border-neutral-200 bg-neutral-50 sticky top-0">
        <div className="w-8 flex-shrink-0" /> {/* Drag handle space */}
        {properties
          .filter((p) => p.isVisible !== false)
          .map((property) => (
            <div
              key={property.id}
              className="flex items-center gap-1 px-2 py-2 border-r border-neutral-200 text-sm font-medium text-neutral-700"
              style={{ width: property.width || 150 }}
            >
              <span className="truncate">{property.name}</span>
              <ChevronDown className="h-3 w-3 text-neutral-400 flex-shrink-0" />
            </div>
          ))}
        <div className="flex-1 flex items-center px-2">
          <Button variant="ghost" size="sm" className="text-neutral-500">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Data Rows */}
      <div>
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-neutral-500">
            <p>No data yet</p>
            <Button variant="ghost" size="sm" onClick={onAddRow} className="mt-2">
              <Plus className="h-4 w-4 mr-1" />
              Add row
            </Button>
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="flex border-b border-neutral-100 hover:bg-neutral-50 group"
            >
              {/* Drag Handle */}
              <div className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-neutral-400 cursor-grab" />
              </div>

              {/* Cells */}
              {properties
                .filter((p) => p.isVisible !== false)
                .map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center px-2 py-1.5 border-r border-neutral-100"
                    style={{ width: property.width || 150 }}
                  >
                    <TableCell
                      property={property}
                      value={row.properties[property.id]}
                      isEditing={
                        editingCell?.rowId === row.id &&
                        editingCell?.propertyId === property.id
                      }
                      onStartEdit={() =>
                        setEditingCell({ rowId: row.id, propertyId: property.id })
                      }
                      onEndEdit={() => setEditingCell(null)}
                      onChange={(value) =>
                        handleCellChange(row.id, property.id, value)
                      }
                    />
                  </div>
                ))}

              {/* Actions */}
              <div className="flex-1 flex items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="iconSm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Open page</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteRow(row.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Row Button */}
      <div className="flex items-center px-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddRow}
          className="text-neutral-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>
    </div>
  );
}

interface TableCellProps {
  property: DatabaseProperty;
  value: unknown;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onChange: (value: unknown) => void;
}

function TableCell({
  property,
  value,
  isEditing,
  onStartEdit,
  onEndEdit,
  onChange,
}: TableCellProps) {
  switch (property.type) {
    case "title":
    case "text":
      return isEditing ? (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onEndEdit}
          onKeyDown={(e) => e.key === "Enter" && onEndEdit()}
          className="w-full px-1 py-0.5 text-sm border border-blue-500 rounded outline-none"
          autoFocus
        />
      ) : (
        <div
          className="w-full text-sm truncate cursor-text min-h-[24px]"
          onClick={onStartEdit}
        >
          {(value as string) || (
            <span className="text-neutral-400">Empty</span>
          )}
        </div>
      );

    case "number":
      return isEditing ? (
        <input
          type="number"
          value={(value as number) || ""}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onBlur={onEndEdit}
          onKeyDown={(e) => e.key === "Enter" && onEndEdit()}
          className="w-full px-1 py-0.5 text-sm border border-blue-500 rounded outline-none"
          autoFocus
        />
      ) : (
        <div
          className="w-full text-sm truncate cursor-text min-h-[24px]"
          onClick={onStartEdit}
        >
          {value !== undefined && value !== null ? String(value) : (
            <span className="text-neutral-400">Empty</span>
          )}
        </div>
      );

    case "select":
      const selectedOption = property.options?.find((o) => o.id === value);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full text-left">
              {selectedOption ? (
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: selectedOption.color }}
                >
                  {selectedOption.name}
                </span>
              ) : (
                <span className="text-neutral-400 text-sm">Select...</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {property.options?.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => onChange(option.id)}
              >
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: option.color }}
                >
                  {option.name}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case "multiSelect":
      const selectedOptions = (value as string[])
        ?.map((id) => property.options?.find((o) => o.id === id))
        .filter(Boolean);
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions?.map((option) => (
            <span
              key={option!.id}
              className="inline-block px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: option!.color }}
            >
              {option!.name}
            </span>
          ))}
          {(!selectedOptions || selectedOptions.length === 0) && (
            <span className="text-neutral-400 text-sm">Select...</span>
          )}
        </div>
      );

    case "date":
      return isEditing ? (
        <input
          type="date"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onEndEdit}
          className="w-full px-1 py-0.5 text-sm border border-blue-500 rounded outline-none"
          autoFocus
        />
      ) : (
        <div
          className="w-full text-sm truncate cursor-text min-h-[24px]"
          onClick={onStartEdit}
        >
          {value ? new Date(value as string).toLocaleDateString() : (
            <span className="text-neutral-400">Empty</span>
          )}
        </div>
      );

    case "checkbox":
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
      );

    case "url":
      return isEditing ? (
        <input
          type="url"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onEndEdit}
          onKeyDown={(e) => e.key === "Enter" && onEndEdit()}
          className="w-full px-1 py-0.5 text-sm border border-blue-500 rounded outline-none"
          autoFocus
        />
      ) : (
        <div
          className="w-full text-sm truncate cursor-text min-h-[24px]"
          onClick={onStartEdit}
        >
          {value ? (
            <a
              href={value as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {value as string}
            </a>
          ) : (
            <span className="text-neutral-400">Empty</span>
          )}
        </div>
      );

    default:
      return (
        <div className="w-full text-sm text-neutral-400">
          {String(value || "Empty")}
        </div>
      );
  }
}
