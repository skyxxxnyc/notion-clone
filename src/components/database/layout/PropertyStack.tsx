import React, { useState } from "react";
import { useAppStore } from "@/store";
import { Page, DatabaseProperty } from "@/types";
import { PropertySection } from "@/types/layout";
import { PropertyRenderer } from "./PropertyRenderer";
import { MessageSquare, Clock, User as UserIcon, ChevronDown, ChevronRight } from "lucide-react";

interface PropertyStackProps {
    page: Page;
    propertyIds?: string[]; // Optional specific properties to show
    sections?: PropertySection[]; // Organize properties into collapsible sections
    className?: string;
}

export function PropertyStack({ page, propertyIds, sections, className }: PropertyStackProps) {
    const { pages, databaseRows, updateDatabaseRow } = useAppStore();
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

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
        return <div className="text-sm text-neutral-400">Loading properties...</div>;
    }

    // 3. Determine which properties to show
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

    const toggleSection = (sectionId: string) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const renderProperty = (property: DatabaseProperty) => (
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
    );

    // If sections are provided, render with collapsible sections
    if (sections && sections.length > 0) {
        return (
            <div className={className}>
                {sections.map(section => {
                    const sectionProps = config.properties.filter(p =>
                        section.propertyIds.includes(p.id)
                    );
                    const isCollapsed = collapsedSections.has(section.id);

                    return (
                        <div key={section.id} className="mb-4">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 mb-2 uppercase tracking-wide"
                            >
                                {isCollapsed ? (
                                    <ChevronRight className="w-3 h-3" />
                                ) : (
                                    <ChevronDown className="w-3 h-3" />
                                )}
                                {section.name}
                            </button>
                            {!isCollapsed && (
                                <div>
                                    {sectionProps.map(renderProperty)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Otherwise, render flat list
    return (
        <div className={className}>
            {propertiesToShow.map(renderProperty)}
        </div>
    );
}
