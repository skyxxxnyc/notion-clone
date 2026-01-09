export type WidgetType =
    | "recent_pages"
    | "favorites"
    | "quick_actions"
    | "calendar"
    | "task_summary"
    | "workspace_stats"
    | "activity_feed";

export interface Widget {
    id: string;
    type: WidgetType;
    title: string;
    size: "small" | "medium" | "large";
    position: {
        x: number;
        y: number;
    };
    config?: Record<string, any>;
}

export interface DashboardLayout {
    id: string;
    workspaceId: string;
    widgets: Widget[];
    columns: number;
}

export const DEFAULT_WIDGETS: Omit<Widget, "id">[] = [
    {
        type: "quick_actions",
        title: "Quick Actions",
        size: "medium",
        position: { x: 0, y: 0 }
    },
    {
        type: "recent_pages",
        title: "Recent Pages",
        size: "medium",
        position: { x: 1, y: 0 }
    },
    {
        type: "favorites",
        title: "Favorites",
        size: "medium",
        position: { x: 0, y: 1 }
    },
    {
        type: "workspace_stats",
        title: "Workspace Stats",
        size: "small",
        position: { x: 1, y: 1 }
    }
];
