"use client";

import React from "react";
import { NewsItem } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";

interface NewsListItemProps {
    item: NewsItem;
}

export function NewsListItem({ item }: NewsListItemProps) {
    return (
        <div className="flex items-start gap-4 p-4 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50 transition-colors group">
            {/* Thumbnail (Small) */}
            {item.thumbnail && (
                <div className="w-24 h-16 flex-shrink-0 rounded-md overflow-hidden bg-neutral-950">
                    <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                    {item.feedIcon && <span>{item.feedIcon}</span>}
                    <span className="font-medium text-neutral-400">{item.feedName}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })}</span>
                </div>

                <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors mb-1 truncate">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-neutral-500 underline-offset-2">
                        {item.title}
                    </a>
                </h3>

                {item.contentSnippet && (
                    <p className="text-xs text-neutral-500 line-clamp-1">
                        {item.contentSnippet.replace(/<[^>]*>?/gm, "")}
                    </p>
                )}
            </div>

            <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-neutral-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ExternalLink className="h-4 w-4" />
            </a>
        </div>
    );
}
