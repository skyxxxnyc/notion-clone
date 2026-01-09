import React from "react";
import { ImportData, FieldMapping } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ImportPreviewProps {
    data: ImportData;
    mappings: FieldMapping[];
}

export function ImportPreview({ data, mappings }: ImportPreviewProps) {
    const enabledMappings = mappings.filter(m => m.enabled);
    const previewRows = data.rows.slice(0, 5);

    if (previewRows.length === 0) {
        return <div className="text-sm text-neutral-500 italic">No data found to preview.</div>;
    }

    return (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Data Preview (First 5 rows)
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b border-neutral-200 text-neutral-500 font-medium text-xs uppercase">
                        <tr>
                            {enabledMappings.map(m => (
                                <th key={m.sourceKey} className="px-4 py-2 whitespace-nowrap bg-neutral-50/50">
                                    {m.targetName}
                                    <span className="ml-1 text-[10px] text-neutral-400 font-normal lowercase">({m.targetType})</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white">
                        {previewRows.map((row, i) => (
                            <tr key={i}>
                                {enabledMappings.map(m => (
                                    <td key={m.sourceKey} className="px-4 py-2 whitespace-nowrap max-w-[200px] truncate text-neutral-700">
                                        {String(row[m.sourceKey] ?? "")}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.rows.length > 5 && (
                <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500">
                    And {data.rows.length - 5} more rows...
                </div>
            )}
        </div>
    );
}
