"use client";

import React from "react";
import { Filter, DatabaseProperty, FilterOperator } from "@/types";
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
import { Input } from "@/components/ui/input";
import { X, Filter as FilterIcon, Plus, Trash2 } from "lucide-react";
import { generateId } from "@/lib/utils";

interface FilterMenuProps {
    properties: DatabaseProperty[];
    filters: Filter[];
    onChange: (filters: Filter[]) => void;
}

const OPERATORS: { value: FilterOperator; label: string }[] = [
    { value: "equals", label: "Is" },
    { value: "notEquals", label: "Is not" },
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Does not contain" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" },
    { value: "isEmpty", label: "Is empty" },
    { value: "isNotEmpty", label: "Is not empty" },
];

export function FilterMenu({ properties, filters, onChange }: FilterMenuProps) {
    const handleAddFilter = () => {
        // Default to first property
        const firstProp = properties[0];
        if (!firstProp) return;

        const newFilter: Filter = {
            id: generateId(),
            propertyId: firstProp.id,
            operator: "contains",
            value: "",
        };
        onChange([...filters, newFilter]);
    };

    const handleUpdateFilter = (id: string, updates: Partial<Filter>) => {
        onChange(
            filters.map((f) => (f.id === id ? { ...f, ...updates } : f))
        );
    };

    const handleRemoveFilter = (id: string) => {
        onChange(filters.filter((f) => f.id !== id));
    };

    // Filter out system properties if needed, or keeping all
    const filterableProperties = properties.filter(p => p.isVisible !== false);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={filters.length > 0 ? "text-blue-600 bg-blue-50" : "text-neutral-600"}
                >
                    <FilterIcon className="h-4 w-4 mr-1" />
                    Filter
                    {filters.length > 0 && <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">{filters.length}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-3">
                    <div className="text-sm font-medium text-neutral-500 mb-2">
                        Filter by...
                    </div>

                    {filters.length === 0 ? (
                        <div className="text-sm text-neutral-400 text-center py-4">
                            No filters applied
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filters.map((filter) => {
                                const property = properties.find((p) => p.id === filter.propertyId);

                                return (
                                    <div key={filter.id} className="flex flex-col gap-2 bg-neutral-50 p-2 rounded-md border border-neutral-100">
                                        <div className="flex items-center gap-2">
                                            {/* Property Select */}
                                            <Select
                                                value={filter.propertyId}
                                                onValueChange={(val) => handleUpdateFilter(filter.id, { propertyId: val })}
                                            >
                                                <SelectTrigger className="h-7 text-xs w-[100px]">
                                                    <SelectValue placeholder="Property" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filterableProperties.map((p) => (
                                                        <SelectItem key={p.id} value={p.id} className="text-xs">
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* Operator Select */}
                                            <Select
                                                value={filter.operator}
                                                onValueChange={(val) => handleUpdateFilter(filter.id, { operator: val as FilterOperator })}
                                            >
                                                <SelectTrigger className="h-7 text-xs flex-1">
                                                    <SelectValue placeholder="Operator" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {OPERATORS.map((op) => (
                                                        <SelectItem key={op.value} value={op.value} className="text-xs">
                                                            {op.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                variant="ghost"
                                                size="iconSm"
                                                className="h-7 w-7 text-neutral-400 hover:text-red-500"
                                                onClick={() => handleRemoveFilter(filter.id)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {/* Value Input */}
                                        {!["isEmpty", "isNotEmpty"].includes(filter.operator) && (
                                            property?.type === "select" || property?.type === "multiSelect" ? (
                                                <Select
                                                    value={String(filter.value)}
                                                    onValueChange={(val) => handleUpdateFilter(filter.id, { value: val })}
                                                >
                                                    <SelectTrigger className="h-7 text-xs w-full">
                                                        <SelectValue placeholder="Select option" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {property.options?.map(opt => (
                                                            <SelectItem key={opt.id} value={opt.name} className="text-xs">
                                                                {opt.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    className="h-7 text-xs"
                                                    placeholder="Type a value..."
                                                    value={String(filter.value)}
                                                    onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                                                />
                                            )
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-neutral-500 justify-start"
                        onClick={handleAddFilter}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add filter
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
