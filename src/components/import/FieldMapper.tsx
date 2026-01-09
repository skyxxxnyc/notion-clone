import React, { useEffect, useState } from "react";
import { ImportData, FieldMapping } from "./types";
import { PropertyType } from "@/types";
import { Table } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface FieldMapperProps {
    data: ImportData;
    onChange: (mappings: FieldMapping[]) => void;
}

const PROPERTY_TYPES: PropertyType[] = [
    "text", "number", "select", "multiSelect", "date",
    "checkbox", "url", "email", "phone", "status"
];

// Helper to guess type based on value
function guessType(value: any): PropertyType {
    if (value === null || value === undefined) return "text";
    if (typeof value === 'number') return "number";
    if (typeof value === 'boolean') return "checkbox";
    if (value instanceof Date) return "date";
    if (typeof value === 'string') {
        if (value.match(/^\d{4}-\d{2}-\d{2}/)) return "date";
        if (value.includes('@')) return "email";
        if (value.match(/^https?:\/\//)) return "url";
    }
    return "text";
}

export function FieldMapper({ data, onChange }: FieldMapperProps) {
    const [mappings, setMappings] = useState<FieldMapping[]>([]);

    useEffect(() => {
        // Initialize mappings
        const initialMappings: FieldMapping[] = data.fields.map(field => ({
            sourceKey: field.key,
            targetName: field.key,
            targetType: guessType(field.sample),
            enabled: true
        }));
        setMappings(initialMappings);
        onChange(initialMappings);
    }, [data, onChange]); // Be careful with onChange dependency loop if parent memoizes poorly

    const handleUpdate = (index: number, updates: Partial<FieldMapping>) => {
        const newMappings = [...mappings];
        newMappings[index] = { ...newMappings[index], ...updates };
        setMappings(newMappings);
        onChange(newMappings);
    };

    return (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
                <Table className="h-4 w-4 text-neutral-500" />
                <span className="font-medium text-sm text-neutral-700">Map properties</span>
            </div>

            <div className="divide-y divide-neutral-200 max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-[1fr_1fr_120px_60px] gap-4 px-4 py-2 bg-white text-xs font-semibold text-neutral-500">
                    <div>Source Column</div>
                    <div>Destination Property</div>
                    <div>Type</div>
                    <div className="text-right">Import</div>
                </div>

                {mappings.map((mapping, index) => {
                    const sample = data.fields.find(f => f.key === mapping.sourceKey)?.sample;

                    return (
                        <div key={mapping.sourceKey} className="grid grid-cols-[1fr_1fr_120px_60px] gap-4 px-4 py-3 items-center bg-white">
                            {/* Source */}
                            <div className="min-w-0">
                                <div className="font-medium text-sm text-neutral-900 truncate" title={mapping.sourceKey}>
                                    {mapping.sourceKey}
                                </div>
                                <div className="text-xs text-neutral-400 truncate mt-0.5">
                                    Sample: {String(sample).substring(0, 30)}
                                </div>
                            </div>

                            {/* Target Name */}
                            <div>
                                <Input
                                    value={mapping.targetName}
                                    onChange={(e) => handleUpdate(index, { targetName: e.target.value })}
                                    className="h-8"
                                    placeholder="Property name"
                                    disabled={!mapping.enabled}
                                />
                            </div>

                            {/* Type Selector */}
                            <div>
                                <Select
                                    value={mapping.targetType}
                                    onValueChange={(val: PropertyType) => handleUpdate(index, { targetType: val })}
                                    disabled={!mapping.enabled}
                                >
                                    <SelectTrigger className="h-8 w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROPERTY_TYPES.map(type => (
                                            <SelectItem key={type} value={type}>
                                                <span className="capitalize">{type}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Enable Toggle */}
                            <div className="flex justify-end">
                                <Switch
                                    checked={mapping.enabled}
                                    onCheckedChange={(checked) => handleUpdate(index, { enabled: checked })}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
