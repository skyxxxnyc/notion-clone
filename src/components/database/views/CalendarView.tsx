"use client";

import React, { useState } from "react";
import type { Page, DatabaseRow } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";

interface CalendarViewProps {
  page: Page;
  rows: DatabaseRow[];
  onAddRow: () => void;
}

export function CalendarView({ page, rows, onAddRow }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getRowsForDay = (day: Date): DatabaseRow[] => {
    return rows.filter((row) => {
      const dateValue = row.properties["date"];
      if (!dateValue) return false;
      return isSameDay(new Date(dateValue as string), day);
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="iconSm" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="ghost" size="iconSm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-neutral-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-sm font-medium text-neutral-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map((day, index) => {
          const dayRows = getRowsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={index}
              className={cn(
                "border-b border-r border-neutral-200 p-1 min-h-[100px]",
                !isCurrentMonth && "bg-neutral-50"
              )}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 text-sm rounded-full",
                    isCurrentDay && "bg-blue-600 text-white",
                    !isCurrentDay && !isCurrentMonth && "text-neutral-400",
                    !isCurrentDay && isCurrentMonth && "text-neutral-900"
                  )}
                >
                  {format(day, "d")}
                </span>
                <Button
                  variant="ghost"
                  size="iconSm"
                  className="opacity-0 hover:opacity-100 transition-opacity"
                  onClick={onAddRow}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayRows.slice(0, 3).map((row) => (
                  <div
                    key={row.id}
                    className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200 transition-colors"
                  >
                    {(row.properties["title"] as string) || "Untitled"}
                  </div>
                ))}
                {dayRows.length > 3 && (
                  <div className="px-1.5 py-0.5 text-xs text-neutral-500">
                    +{dayRows.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
