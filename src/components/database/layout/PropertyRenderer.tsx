import React, { useEffect, useRef } from "react";
import { DatabaseProperty, PropertyValue, SelectOption } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Auto-resize textarea component
function AutoResizeTextarea({ value, onChange, placeholder, className }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.max(32, textarea.scrollHeight)}px`;
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
                "w-full px-2 py-1 bg-transparent border border-transparent",
                "hover:border-neutral-200 focus:border-blue-500 focus:outline-none",
                "resize-none overflow-hidden rounded-md text-sm",
                "min-h-[32px]",
                className
            )}
            rows={1}
        />
    );
}

interface PropertyRendererProps {
    property: DatabaseProperty;
    value: PropertyValue;
    onChange: (value: PropertyValue) => void;
    className?: string;
}

export function PropertyRenderer({
    property,
    value,
    onChange,
    className,
}: PropertyRendererProps) {
    switch (property.type) {
        case "text":
        case "url":
        case "email":
        case "phone":
            return (
                <AutoResizeTextarea
                    value={(value as string) || ""}
                    onChange={(val) => onChange(val)}
                    placeholder="Empty"
                    className={className}
                />
            );

        case "number":
            return (
                <Input
                    type="number"
                    value={(value as number) || ""}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className={cn("h-8 px-2 bg-transparent border-transparent hover:border-neutral-200 focus:border-blue-500", className)}
                    placeholder="Empty"
                />
            );

        case "select":
            const options = property.options || [];
            const selectedOption = options.find((o) => o.id === value?.toString());

            return (
                <div className={cn("relative", className)}>
                    <Select
                        value={value?.toString()}
                        onValueChange={(val) => {
                            // If val matches an option ID, use it. In a real app we might store ID or full object
                            onChange(val);
                        }}
                    >
                        <SelectTrigger className="h-8 border-transparent hover:bg-neutral-100 bg-transparent px-2">
                            <SelectValue placeholder="Select an option">
                                {selectedOption ? (
                                    <Badge
                                        variant="secondary"
                                        className="font-normal"
                                        style={{ backgroundColor: selectedOption.color }}
                                    >
                                        {selectedOption.name}
                                    </Badge>
                                ) : (
                                    <span className="text-neutral-400">Empty</span>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: option.color }}
                                        />
                                        {option.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );

        // Simplistic handling for other types
        default:
            return (
                <div className="text-sm text-neutral-500 px-2 py-1">
                    {JSON.stringify(value) || "Empty"}
                </div>
            );
    }
}
