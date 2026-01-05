"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import type { Page, DatabaseViewType, DatabaseRow } from "@/types";
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
  Filter,
  SortAsc,
  Search,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

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
  const { databaseRows, createDatabaseRow, updatePage } = useAppStore();

  const [currentViewType, setCurrentViewType] = useState<DatabaseViewType>("table");
  const [searchQuery, setSearchQuery] = useState("");

  const rows = databaseRows[page.id] || [];
  const config = page.databaseConfig;

  const handleAddRow = () => {
    createDatabaseRow(page.id);
  };

  const filteredRows = rows.filter((row) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(row.properties).some((value) =>
      String(value).toLowerCase().includes(query)
    );
  });

  const renderView = () => {
    switch (currentViewType) {
      case "table":
        return (
          <TableView
            page={page}
            rows={filteredRows}
            onAddRow={handleAddRow}
          />
        );
      case "board":
        return (
          <BoardView
            page={page}
            rows={filteredRows}
            onAddRow={handleAddRow}
          />
        );
      case "calendar":
        return (
          <CalendarView
            page={page}
            rows={filteredRows}
            onAddRow={handleAddRow}
          />
        );
      case "gallery":
        return (
          <GalleryView
            page={page}
            rows={filteredRows}
            onAddRow={handleAddRow}
          />
        );
      case "list":
        return (
          <ListView
            page={page}
            rows={filteredRows}
            onAddRow={handleAddRow}
          />
        );
      default:
        return (
          <TableView
            page={page}
            rows={filteredRows}
            onAddRow={handleAddRow}
          />
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          {/* View Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            {(["table", "board", "calendar", "gallery", "list"] as DatabaseViewType[]).map(
              (viewType) => (
                <button
                  key={viewType}
                  onClick={() => setCurrentViewType(viewType)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded text-sm capitalize transition-colors",
                    currentViewType === viewType
                      ? "bg-white shadow-sm text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900"
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
              <Button variant="ghost" size="sm">
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
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 pl-8 pr-3 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Filter */}
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>

          {/* Sort */}
          <Button variant="ghost" size="sm">
            <SortAsc className="h-4 w-4 mr-1" />
            Sort
          </Button>

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
