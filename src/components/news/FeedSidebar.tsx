"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { NewsFeed } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Rss,
    Trash2,
    Newspaper,
    Hash,
    MessageSquare,
    Globe,
    Plus
} from "lucide-react";
import { deleteNewsFeed } from "@/actions/news";

interface FeedSidebarProps {
    feeds: NewsFeed[];
    selectedFeedId: string | null;
    onSelectFeed: (id: string | null) => void;
    onAddFeed: () => void;
    className?: string;
}

export function FeedSidebar({
    feeds,
    selectedFeedId,
    onSelectFeed,
    onAddFeed,
    className,
}: FeedSidebarProps) {

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this feed?")) {
            await deleteNewsFeed(id);
            window.location.reload(); // Simple reload to refresh state for now
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "reddit": return <MessageSquare className="h-4 w-4" />;
            case "topic": return <Hash className="h-4 w-4" />;
            default: return <Rss className="h-4 w-4" />;
        }
    };

    return (
        <div className={cn("flex flex-col bg-neutral-950", className)}>
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                    Feeds
                </h2>
                <Button variant="ghost" size="iconSm" onClick={onAddFeed} className="text-neutral-400 hover:text-white">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    <button
                        onClick={() => onSelectFeed(null)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            selectedFeedId === null
                                ? "bg-neutral-800 text-white"
                                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                        )}
                    >
                        <Globe className="h-4 w-4" />
                        All News
                    </button>

                    {feeds.map((feed) => (
                        <div
                            key={feed.id}
                            onClick={() => onSelectFeed(feed.id)}
                            className={cn(
                                "group relative w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                                selectedFeedId === feed.id
                                    ? "bg-neutral-800 text-white"
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                            )}
                        >
                            <span className="flex-shrink-0">{getIcon(feed.type)}</span>
                            <span className="truncate flex-1 text-left">{feed.name}</span>

                            <button
                                onClick={(e) => handleDelete(e, feed.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
