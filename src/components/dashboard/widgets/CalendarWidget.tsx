import React from "react";
import { Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";

export function CalendarWidget() {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get day names
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Calculate starting day offset
    const startDay = monthStart.getDay();

    return (
        <div>
            <div className="text-center mb-4">
                <div className="text-lg font-semibold text-neutral-900">
                    {format(today, "MMMM yyyy")}
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-neutral-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Calendar days */}
                {days.map(day => (
                    <div
                        key={day.toISOString()}
                        className={cn(
                            "aspect-square flex items-center justify-center text-sm rounded-md transition-colors",
                            isToday(day)
                                ? "bg-blue-500 text-white font-semibold"
                                : "text-neutral-700 hover:bg-neutral-100"
                        )}
                    >
                        {format(day, "d")}
                    </div>
                ))}
            </div>
        </div>
    );
}
