"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import type { Page, DatabaseViewType, DatabaseRow, Filter, Sort, FilterOperator } from "@/types";
import { cn } from "@/lib/utils";
import { TableView } from "./views/TableView";
import { BoardView } from "./views/BoardView";
import { CalendarView } from "./views/CalendarView";
import { GalleryView } from "./views/GalleryView";
import { ListView } from "./views/ListView";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  LayoutGrid,
  Calendar,
  Image,
  List,
  Plus,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { FilterMenu } from "./FilterMenu";
import { SortMenu } from "./SortMenu";

interface DatabaseViewProps {
  page: Page;
}

const VIEW_ICONS: Record<DatabaseViewType, React.ReactNode> = {
  table: <Table className="h-4 w-4" />,
  board: <LayoutGrid className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  gallery: <Image className="h-4 w-4" />,
  list: <List className="h-4 w-4" />,
  timeline: <List className="h-4 w-4" />,
};

export function DatabaseView({ page }: DatabaseViewProps) {
  const { databaseRows, createDatabaseRow } = useAppStore();

  const [currentViewType, setCurrentViewType] = useState<DatabaseViewType>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sorts, setSorts] = useState<Sort[]>([]);

  const rows = databaseRows[page.id] || [];
  const config = page.databaseConfig;

  const handleAddRow = () => {
    createDatabaseRow(page.id);
  };

  const processedRows = useMemo(() => {
    let result = [...rows];

    // 1. Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row.properties).some((value) =>
          String(value).toLowerCase().includes(query)
        )
      );
    }

    // 2. Filters
    filters.forEach((filter) => {
      result = result.filter((row) => {
        const value = row.properties[filter.propertyId];
        const filterVal = filter.value as string;
        const stringVal = String(value || "").toLowerCase();
        const filterString = String(filterVal).toLowerCase();

        switch (filter.operator) {
          case "equals": return stringVal === filterString;
          case "notEquals": return stringVal !== filterString;
          case "contains": return stringVal.includes(filterString);
          case "notContains": return !stringVal.includes(filterString);
          case "startsWith": return stringVal.startsWith(filterString);
          case "endsWith": return stringVal.endsWith(filterString);
          case "isEmpty": return !value || value === "";
          case "isNotEmpty": return !!value && value !== "";
          default: return true;
        }
      });
    });

    // 3. Sorts
    if (sorts.length > 0) {
      result.sort((a, b) => {
        for (const sort of sorts) {
          const valA = a.properties[sort.propertyId];
          const valB = b.properties[sort.propertyId];

          if (valA === valB) continue;

          const strA = String(valA || "");
          const strB = String(valB || "");

          const comparison = strA.localeCompare(strB, undefined, { numeric: true });

          if (comparison !== 0) {
            return sort.direction === "ascending" ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [rows, searchQuery, filters, sorts]);

  const renderView = () => {
    const ViewComponent = {
      table: TableView,
      board: BoardView,
      calendar: CalendarView,
      gallery: GalleryView,
      list: ListView,
      timeline: TableView, // Fallback
    }[currentViewType] || TableView;

    return (
      <ViewComponent
        page={page}
        rows={processedRows}
        onAddRow={handleAddRow}
      />
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          {/* View Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 rounded-sm p-1">
            {(["table", "board", "calendar", "gallery", "list"] as DatabaseViewType[]).map(
              (viewType) => (
                <button
                  key={viewType}
                  onClick={() => setCurrentViewType(viewType)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-sm capitalize transition-colors",
                    currentViewType === viewType
                      ? "bg-neutral-800 shadow-sm text-neutral-100"
                      : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  {VIEW_ICONS[viewType]}
                  <span className="hidden sm:inline">{viewType}</span>
                </button>
              )
            )}
          </div>

          {/* Add View */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(["table", "board", "calendar", "gallery", "list"] as DatabaseViewType[]).map(
                (viewType) => (
                  <DropdownMenuItem
                    key={viewType}
                    onClick={() => setCurrentViewType(viewType)}
                  >
                    {VIEW_ICONS[viewType]}
                    <span className="ml-2 capitalize">{viewType}</span>
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 pl-8 pr-3 py-1.5 text-sm bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-700 placeholder:text-neutral-600"
            />
          </div>

          {/* Filter */}
          <FilterMenu
            properties={config?.properties || []}
            filters={filters}
            onChange={setFilters}
          />

          {/* Sort */}
          <SortMenu
            properties={config?.properties || []}
            sorts={sorts}
            onChange={setSorts}
          />

          {/* More */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="iconSm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Properties</DropdownMenuItem>
              <DropdownMenuItem>Layout</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-auto">{renderView()}</div>
    </div>
  );
}
