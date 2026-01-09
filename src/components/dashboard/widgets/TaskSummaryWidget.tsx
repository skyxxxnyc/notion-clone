import React from "react";
import { useAppStore } from "@/store";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

export function TaskSummaryWidget() {
    const { pages, databaseRows, currentWorkspaceId } = useAppStore();

    // Find all task databases (looking for status property)
    const taskDatabases = Object.values(pages).filter(
        page => page.isDatabase &&
            page.workspaceId === currentWorkspaceId &&
            page.databaseConfig?.properties?.some(p => p.type === "select" && p.name.toLowerCase().includes("status"))
    );

    // Count tasks across all task databases
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;

    taskDatabases.forEach(db => {
        const statusProp = db.databaseConfig?.properties.find(
            p => p.type === "select" && p.name.toLowerCase().includes("status")
        );
        if (!statusProp) return;

        const dbRows = databaseRows[db.id] || [];
        totalTasks += dbRows.length;

        dbRows.forEach(row => {
            const status = row.properties[statusProp.id];
            if (typeof status === "string") {
                const statusLower = status.toLowerCase();
                if (statusLower.includes("done") || statusLower.includes("complete")) {
                    completedTasks++;
                } else if (statusLower.includes("progress") || statusLower.includes("doing")) {
                    inProgressTasks++;
                }
            }
        });
    });

    const pendingTasks = totalTasks - completedTasks - inProgressTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (totalTasks === 0) {
        return (
            <div className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No tasks found</p>
                <p className="text-xs text-neutral-400 mt-1">
                    Create a database with a Status property
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-center">
                <div className="text-4xl font-bold text-neutral-900 mb-1">
                    {completionRate}%
                </div>
                <div className="text-sm text-neutral-500">
                    Completion Rate
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-neutral-700">Completed</span>
                    </div>
                    <span className="font-semibold text-neutral-900">{completedTasks}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-neutral-700">In Progress</span>
                    </div>
                    <span className="font-semibold text-neutral-900">{inProgressTasks}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-neutral-400" />
                        <span className="text-sm text-neutral-700">Pending</span>
                    </div>
                    <span className="font-semibold text-neutral-900">{pendingTasks}</span>
                </div>
            </div>

            <div className="pt-3 border-t border-neutral-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Total Tasks</span>
                    <span className="font-semibold text-neutral-900">{totalTasks}</span>
                </div>
            </div>
        </div>
    );
}
