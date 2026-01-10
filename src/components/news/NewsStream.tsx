"use client";

import React from "react";
import { NewsItem } from "@/types";
import { NewsCard } from "./NewsCard";
import { NewsListItem } from "./NewsListItem";

interface NewsStreamProps {
    items: NewsItem[];
    viewType: "card" | "list";
}

export function NewsStream({ items, viewType }: NewsStreamProps) {
    if (viewType === "list") {
        return (
            <div className="flex flex-col border border-neutral-800 rounded-lg overflow-hidden">
                {items.map((item) => (
                    <NewsListItem key={item.id} item={item} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
                <NewsCard key={item.id} item={item} />
            ))}
        </div>
    );
}
