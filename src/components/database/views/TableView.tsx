"use client";

import React, { useState } from "react";
import type { Page, DatabaseRow, DatabaseProperty, PropertyType, DatabaseConfig } from "@/types";
import { useAppStore } from "@/store";
import { cn, generateId } from "@/lib/utils";
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  ChevronDown,
  Trash,
  EyeOff,
  Settings,
  Type,
  ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TableViewProps {
  page: Page;
  rows: DatabaseRow[];
  onAddRow: () => void;
}

// Default properties for a new database
const DEFAULT_PROPERTIES: DatabaseProperty[] = [
  { id: "title", name: "Name", type: "title", isVisible: true, width: 250 },
  {
    id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
      { id: "1", name: "Not started", color: "#e5e5e5" },
      { id: "2", name: "In progress", color: "#fef3c7" },
      { id: "3", name: "Done", color: "#dcfce7" },
    ]
  },
  { id: "date", name: "Date", type: "date", isVisible: true, width: 120 },
  {
    id: "tags", name: "Tags", type: "multiSelect", isVisible: true, width: 150, options: [
      { id: "1", name: "Important", color: "#fee2e2" },
      { id: "2", name: "Work", color: "#dbeafe" },
      { id: "3", name: "Personal", color: "#dcfce7" },
    ]
  },
];

const PROPERTY_TYPES: { type: PropertyType; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "number", label: "Number" },
  { type: "select", label: "Select" },
  { type: "multiSelect", label: "Multi-select" },
  { type: "date", label: "Date" },
  { type: "checkbox", label: "Checkbox" },
  { type: "url", label: "URL" },
  { type: "email", label: "Email" },
  { type: "phone", label: "Phone" },
];

export function TableView({ page, rows, onAddRow }: TableViewProps) {
  const { updateDatabaseRow, deleteDatabaseRow, setCurrentPage, updatePage } = useAppStore();
  const config = page.databaseConfig || {
    properties: DEFAULT_PROPERTIES,
    views: [],
    defaultViewId: "default"
  };
  const properties = config.properties;

  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    propertyId: string;
  } | null>(null);
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 } // 8px drag required
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateConfig = (newConfig: Partial<DatabaseConfig>) => {
    updatePage(page.id, { databaseConfig: { ...config, ...newConfig } });
  };

  const handleUpdateProperty = (propertyId: string, updates: Partial<DatabaseProperty>) => {
    const newProperties = properties.map(p => p.id === propertyId ? { ...p, ...updates } : p);
    updateConfig({ properties: newProperties });
  };

  const handleAddProperty = () => {
    const newProp: DatabaseProperty = {
      id: generateId(),
      name: "New Column",
      type: "text",
      isVisible: true,
      width: 200
    };
    updateConfig({ properties: [...properties, newProp] });
  };

  const handleDeleteProperty = (propertyId: string) => {
    const newProperties = properties.filter(p => p.id !== propertyId);
    updateConfig({ properties: newProperties });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = properties.findIndex((p) => p.id === active.id);
      const newIndex = properties.findIndex((p) => p.id === over.id);

      const newProperties = arrayMove(properties, oldIndex, newIndex);
      updateConfig({ properties: newProperties });
    }
  };

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

  const visibleProperties = properties.filter(p => p.isVisible !== false);

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Header Row */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10">
          <div className="w-8 flex-shrink-0 border-r border-neutral-200" /> {/* Row Drag handle column */}

          <SortableContext
            items={visibleProperties.map(p => p.id)}
            strategy={horizontalListSortingStrategy}
          >
            {visibleProperties.map((property) => (
              <SortableHeader
                key={property.id}
                property={property}
                onUpdate={handleUpdateProperty}
                onDelete={handleDeleteProperty}
                isHighlighted={highlightedPropertyId === property.id}
                onToggleHighlight={() => setHighlightedPropertyId(curr => curr === property.id ? null : property.id)}
              />
            ))}
          </SortableContext>

          <div className="flex-1 flex items-center px-2 min-w-[50px] border-l border-neutral-200">
            <Button variant="ghost" size="sm" className="text-neutral-500" onClick={handleAddProperty}>
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
                {/* Row Drag Handle */}
                <div className="w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-grab border-r border-transparent group-hover:border-neutral-200">
                  <GripVertical className="h-4 w-4 text-neutral-400" />
                </div>

                {/* Cells */}
                {visibleProperties.map((property) => (
                  <div
                    key={property.id}
                    className={cn(
                      "flex items-center px-2 py-1.5 border-r border-neutral-100 overflow-hidden",
                      highlightedPropertyId === property.id && "bg-blue-50/50"
                    )}
                    style={{ width: property.width || 150, minWidth: property.width || 150 }}
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
                      onOpenPage={() => setCurrentPage(row.id)}
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
                      <DropdownMenuItem onClick={() => setCurrentPage(row.id)}>
                        Open page
                      </DropdownMenuItem>
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
      </DndContext>

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

interface SortableHeaderProps {
  property: DatabaseProperty;
  onUpdate: (id: string, updates: Partial<DatabaseProperty>) => void;
  onDelete: (id: string) => void;
  isHighlighted?: boolean;
  onToggleHighlight?: () => void;
}

function SortableHeader({ property, onUpdate, onDelete, isHighlighted, onToggleHighlight }: SortableHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: property.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: property.width || 150,
    minWidth: property.width || 150,
    opacity: isDragging ? 0.5 : 1,
  };

  const [localWidth, setLocalWidth] = useState<number | null>(null);

  const handleResizeMouseDownSmoother = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.pageX;
    const startWidth = property.width || 150;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setLocalWidth(Math.max(50, startWidth + (moveEvent.pageX - startX)));
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      const finalWidth = Math.max(50, startWidth + (upEvent.pageX - startX));
      onUpdate(property.id, { width: finalWidth });
      setLocalWidth(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, width: localWidth || style.width, minWidth: localWidth || style.minWidth }}
      className={cn(
        "flex items-center gap-1 px-2 py-2 border-r border-neutral-200 text-sm font-medium text-neutral-700 relative group h-[37px]",
        isHighlighted ? "bg-blue-100/50" : "bg-neutral-50"
      )}
    >
      <div
        className="flex-1 flex items-center gap-2 truncate cursor-grab"
        {...attributes}
        {...listeners}
        onClick={onToggleHighlight}
      >
        <span className="truncate">{property.name}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="p-0.5 rounded hover:bg-neutral-200 cursor-pointer text-neutral-400">
            <ChevronDown className="h-3 w-3" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <div className="px-2 py-1.5">
            <input
              className="w-full text-sm border-none outline-none bg-transparent"
              value={property.name}
              onChange={(e) => onUpdate(property.id, { name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Type className="h-3 w-3 mr-2" />
              Type
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {PROPERTY_TYPES.map(pt => (
                <DropdownMenuItem
                  key={pt.type}
                  onClick={() => onUpdate(property.id, { type: pt.type })}
                >
                  {pt.label}
                  {property.type === pt.type && <span className="ml-auto text-xs text-neutral-400">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          {property.id !== 'title' && property.type !== 'title' && (
            <>
              <DropdownMenuItem onClick={() => onUpdate(property.id, { isVisible: false })}>
                <EyeOff className="h-3 w-3 mr-2" />
                Hide in view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(property.id)} className="text-red-600">
                <Trash className="h-3 w-3 mr-2" />
                Delete property
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Resizer */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-20"
        onMouseDown={handleResizeMouseDownSmoother}
        onClick={(e) => e.stopPropagation()}
      />
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
  onOpenPage?: () => void;
}

function TableCell({
  property,
  value,
  isEditing,
  onStartEdit,
  onEndEdit,
  onChange,
  onOpenPage,
}: TableCellProps) {
  switch (property.type) {
    case "title":
    case "text":
    case "email":
    case "phone":
      return isEditing ? (
        <input
          type={property.type === 'email' ? 'email' : 'text'}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onEndEdit}
          onKeyDown={(e) => e.key === "Enter" && onEndEdit()}
          className="w-full px-1 py-0.5 text-sm border border-blue-500 rounded outline-none bg-white"
          autoFocus
        />
      ) : (
        <div
          className="w-full text-sm truncate cursor-text min-h-[24px] relative group pr-12 flex items-center"
          onClick={onStartEdit}
        >
          {(value as string) || (
            <span className="text-neutral-400 opacity-50">Empty</span>
          )}
          {property.type === 'title' && onOpenPage && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white border border-neutral-200 shadow-sm px-1.5 py-0.5 text-xs font-medium text-neutral-600 rounded hover:bg-neutral-50 flex items-center gap-1 z-10 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPage();
              }}
            >
              OPEN
            </button>
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
          className="w-full text-sm truncate cursor-text min-h-[24px] flex items-center"
          onClick={onStartEdit}
        >
          {value !== undefined && value !== null ? String(value) : (
            <span className="text-neutral-400 opacity-50">Empty</span>
          )}
        </div>
      );

    case "select":
      const selectedOption = property.options?.find((o) => o.id === value || o.name === value); // Handle ID or Name fallback
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full text-left min-h-[24px] flex items-center">
              {selectedOption || (value && typeof value === 'string') ? ( // Fallback if value exists but not in options
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: selectedOption?.color || '#e5e5e5' }}
                >
                  {selectedOption?.name || String(value)}
                </span>
              ) : (
                <span className="text-neutral-400 text-sm opacity-50">Select...</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {property.options?.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => onChange(option.name)} // Saving Name usually easier for simple implementation, or ID
              >
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: option.color }}
                >
                  {option.name}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <span className="text-xs text-neutral-400">+ Edit options (Not Impl)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case "multiSelect":
      const values = Array.isArray(value) ? value : (value ? [value] : []);
      const selectedOptionsList = values
        .map((val: string) => property.options?.find((o) => o.id === val || o.name === val) || { id: val, name: val, color: '#e5e5e5' }); // fallback

      return (
        <div className="flex flex-wrap gap-1 min-h-[24px] items-center">
          {selectedOptionsList.length > 0 ? selectedOptionsList.map((option: any) => (
            <span
              key={option.id}
              className="inline-block px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: option.color }}
            >
              {option.name}
            </span>
          )) : (
            <span className="text-neutral-400 text-sm opacity-50">Select...</span>
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
          className="w-full text-sm truncate cursor-text min-h-[24px] flex items-center"
          onClick={onStartEdit}
        >
          {value ? new Date(value as string).toLocaleDateString() : (
            <span className="text-neutral-400 opacity-50">Empty</span>
          )}
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center min-h-[24px]">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
        </div>
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
          className="w-full text-sm truncate cursor-text min-h-[24px] flex items-center"
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
            <span className="text-neutral-400 opacity-50">Empty</span>
          )}
        </div>
      );

    default:
      return (
        <div className="w-full text-sm text-neutral-400 min-h-[24px] flex items-center">
          {String(value || "")}
        </div>
      );
  }
}
