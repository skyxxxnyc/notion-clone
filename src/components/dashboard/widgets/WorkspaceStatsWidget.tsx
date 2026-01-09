import React from "react";
import { useAppStore } from "@/store";
import { FileText, Database, Star, Users } from "lucide-react";

export function WorkspaceStatsWidget() {
    const { pages, currentWorkspaceId } = useAppStore();

    const workspacePages = Object.values(pages).filter(
        page => page.workspaceId === currentWorkspaceId && !page.isArchived
    );

    const stats = [
        {
            icon: FileText,
            label: "Pages",
            count: workspacePages.filter(p => !p.isDatabase).length,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            icon: Database,
            label: "Databases",
            count: workspacePages.filter(p => p.isDatabase).length,
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            icon: Star,
            label: "Favorites",
            count: workspacePages.filter(p => p.isFavourite).length,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50"
        }
    ];

    return (
        <div className="space-y-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <div className="flex-1">
                            <div className="text-2xl font-bold text-neutral-900">
                                {stat.count}
                            </div>
                            <div className="text-xs text-neutral-500">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
