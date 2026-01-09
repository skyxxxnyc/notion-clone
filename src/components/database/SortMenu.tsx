"use client";

import React from "react";
import { Sort, DatabaseProperty } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SortAsc, Plus, X } from "lucide-react";
import { generateId } from "@/lib/utils";

interface SortMenuProps {
    properties: DatabaseProperty[];
    sorts: Sort[];
    onChange: (sorts: Sort[]) => void;
}

export function SortMenu({ properties, sorts, onChange }: SortMenuProps) {
    const handleAddSort = () => {
        const firstProp = properties[0];
        if (!firstProp) return;

        const newSort: Sort = {
            id: generateId(),
            propertyId: firstProp.id,
            direction: "ascending",
        };
        onChange([...sorts, newSort]);
    };

    const handleUpdateSort = (id: string, updates: Partial<Sort>) => {
        onChange(
            sorts.map((s) => (s.id === id ? { ...s, ...updates } : s))
        );
    };

    const handleRemoveSort = (id: string) => {
        onChange(sorts.filter((s) => s.id !== id));
    };

    const sortableProperties = properties.filter(p => p.isVisible !== false);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={sorts.length > 0 ? "text-blue-600 bg-blue-50" : "text-neutral-600"}
                >
                    <SortAsc className="h-4 w-4 mr-1" />
                    Sort
                    {sorts.length > 0 && <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">{sorts.length}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-3">
                    <div className="text-sm font-medium text-neutral-500 mb-2">
                        Sort by...
                    </div>

                    {sorts.length === 0 ? (
                        <div className="text-sm text-neutral-400 text-center py-4">
                            No sorting applied
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sorts.map((sort, index) => (
                                <div key={sort.id} className="flex items-center gap-2 bg-neutral-50 p-2 rounded-md border border-neutral-100">
                                    <span className="text-xs text-neutral-400 w-12">
                                        {index === 0 ? "Sort by" : "Then by"}
                                    </span>

                                    <Select
                                        value={sort.propertyId}
                                        onValueChange={(val) => handleUpdateFilter(sort.id, { propertyId: val })}
                                    >
                                        <SelectTrigger className="h-7 text-xs flex-1">
                                            <SelectValue placeholder="Property" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortableProperties.map(p => (
                                                <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={sort.direction}
                                        onValueChange={(val) => handleUpdateSort(sort.id, { direction: val as "ascending" | "descending" })}
                                    >
                                        <SelectTrigger className="h-7 text-xs w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ascending" className="text-xs">Ascending</SelectItem>
                                            <SelectItem value="descending" className="text-xs">Descending</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="ghost"
                                        size="iconSm"
                                        className="h-7 w-7 text-neutral-400 hover:text-red-500"
                                        onClick={() => handleRemoveSort(sort.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-neutral-500 justify-start"
                        onClick={handleAddSort}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add sort
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );

    function handleUpdateFilter(id: string, updates: any) {
        handleUpdateSort(id, updates);
    }
}
