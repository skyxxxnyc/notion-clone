import React from "react";
import { useAppStore } from "@/store";
import { Page, DatabaseProperty } from "@/types";
import { PropertyRenderer } from "./PropertyRenderer";
import { MessageSquare, Clock, User as UserIcon } from "lucide-react";

interface PropertyStackProps {
    page: Page;
    propertyIds?: string[]; // Optional specific properties to show
    className?: string;
}

export function PropertyStack({ page, propertyIds, className }: PropertyStackProps) {
    const { pages, databaseRows, updateDatabaseRow } = useAppStore();

    // 1. Identify the parent database
    const parentId = page.parentId;
    const parentPage = parentId ? pages[parentId] : null;
    const isDatabaseItem = parentPage?.isDatabase;

    if (!isDatabaseItem || !parentPage?.databaseConfig) {
        return null;
    }

    // 2. Get the config and row data
    const config = parentPage.databaseConfig;
    const dbRows = databaseRows[parentPage.id] || [];
    const row = dbRows.find(r => r.pageId === page.id);

    if (!row) {
        // Should generally exist if page exists and is in database
        return <div className="text-sm text-neutral-400">Loading properties...</div>;
    }

    // 3. Determine which properties to show
    // If propertyIds is provided, show only those.
    // Otherwise, show all visible properties.
    const propertiesToShow = propertyIds
        ? config.properties.filter(p => propertyIds.includes(p.id))
        : config.properties.filter(p => p.isVisible !== false);

    const handlePropertyChange = (propertyId: string, value: any) => {
        updateDatabaseRow(parentPage.id, row.id, {
            properties: {
                ...row.properties,
                [propertyId]: value
            }
        });
    };

    return (
        <div className={className}>
            {propertiesToShow.map(property => (
                <div key={property.id} className="flex py-2 group min-h-[36px]">
                    {/* Label */}
                    <div className="w-[160px] flex items-center gap-2 text-sm text-neutral-500 font-normal shrink-0">
                        <span className="truncate">{property.name}</span>
                    </div>

                    {/* Value / Input */}
                    <div className="flex-1 min-w-0">
                        <PropertyRenderer
                            property={property}
                            value={row.properties[property.id]}
                            onChange={(val) => handlePropertyChange(property.id, val)}
                        />
                    </div>
                </div>
            ))}

            {/* System properties (Created By, etc) could be added here */}
        </div>
    );
}
