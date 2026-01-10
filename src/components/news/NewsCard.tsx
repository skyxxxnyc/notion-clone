"use client";

import React from "react";
import { NewsItem } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsCardProps {
    item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
    return (
        <div className="group flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 hover:shadow-lg transition-all duration-200">
            {/* Thumbnail */}
            {item.thumbnail && (
                <div className="aspect-video w-full overflow-hidden bg-neutral-950 relative">
                    <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent" />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col gap-3">
                {/* Meta */}
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                    {item.feedIcon && <span>{item.feedIcon}</span>}
                    <span className="font-medium text-neutral-400">{item.feedName}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })}</span>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-neutral-200 leading-snug group-hover:text-white transition-colors line-clamp-2">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-neutral-500 underline-offset-2">
                        {item.title}
                    </a>
                </h3>

                {/* Snippet */}
                {item.contentSnippet && (
                    <p className="text-sm text-neutral-400 line-clamp-3">
                        {item.contentSnippet.replace(/<[^>]*>?/gm, "")}
                    </p>
                )}

                {/* Footer Actions */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                    <Button variant="ghost" size="iconSm" className="text-neutral-500 hover:text-neutral-300">
                        <Bookmark className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="iconSm" className="text-neutral-500 hover:text-neutral-300" asChild>
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
