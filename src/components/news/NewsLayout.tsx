"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List as ListIcon, Loader2, Rss } from "lucide-react";
import { FeedSidebar } from "./FeedSidebar";
import { NewsStream } from "./NewsStream";
import { AddFeedDialog } from "./AddFeedDialog";
import { getNewsFeeds, fetchFeedItems } from "@/actions/news";
import { NewsFeed, NewsItem } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateContent } from "@/actions/ai";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { FileText, Sparkles } from "lucide-react";

export function NewsLayout() {
    const [feeds, setFeeds] = useState<NewsFeed[]>([]);
    const [items, setItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
    const [viewType, setViewType] = useState<"card" | "list">("card");
    const [addFeedOpen, setAddFeedOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [summaryText, setSummaryText] = useState("");
    const [generatingSummary, setGeneratingSummary] = useState(false);

    useEffect(() => {
        loadFeeds();
    }, []);

    const loadFeeds = async () => {
        try {
            const data = await getNewsFeeds();
            setFeeds(data);
            if (data.length > 0) {
                refreshItems(data);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const refreshItems = async (currentFeeds: NewsFeed[]) => {
        setRefreshing(true);
        try {
            const newsItems = await fetchFeedItems(currentFeeds);
            setItems(newsItems);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredItems = selectedFeedId
        ? items.filter((item) => item.feedId === selectedFeedId)
        : items;

    const handleSummarize = async () => {
        if (filteredItems.length === 0) return;

        setGeneratingSummary(true);
        setSummaryOpen(true); // Open modal immediately with loading state
        setSummaryText("");

        try {
            // Prepare context (limit to top 20 items to save tokens)
            const context = filteredItems.slice(0, 20).map(item =>
                `- ${item.title}: ${item.contentSnippet || ""}`
            ).join("\n");

            const prompt = `Please provide a concise and engaging daily briefing summary of the following news items. Group them by topic if possible and highlight the most important stories.\n\n${context}`;

            const result = await generateContent(prompt);
            setSummaryText(result || "Failed to generate summary.");
        } catch (error) {
            console.error("Summary failed", error);
            setSummaryText("Error generating summary. Please try again.");
        } finally {
            setGeneratingSummary(false);
        }
    };

    return (
        <div className="flex h-full bg-neutral-900 text-white">
            <FeedSidebar
                feeds={feeds}
                selectedFeedId={selectedFeedId}
                onSelectFeed={setSelectedFeedId}
                onAddFeed={() => setAddFeedOpen(true)}
                className="w-64 flex-shrink-0 border-r border-neutral-800"
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-6 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold">
                            {selectedFeedId
                                ? feeds.find((f) => f.id === selectedFeedId)?.name
                                : "All News"}
                        </h1>
                        {refreshing && <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-neutral-800 rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="iconSm"
                                className={viewType === "card" ? "bg-neutral-700 text-white" : "text-neutral-400"}
                                onClick={() => setViewType("card")}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="iconSm"
                                className={viewType === "list" ? "bg-neutral-700 text-white" : "text-neutral-400"}
                                onClick={() => setViewType("list")}
                            >
                                <ListIcon className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            onClick={handleSummarize}
                            size="sm"
                            variant="secondary"
                            className="bg-purple-900/40 text-purple-200 hover:bg-purple-900/60 border border-purple-800/50"
                            disabled={filteredItems.length === 0 || generatingSummary}
                        >
                            {generatingSummary ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            Summarize
                        </Button>

                        <Button onClick={() => setAddFeedOpen(true)} size="sm" className="bg-red-600 hover:bg-red-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Feed
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                        <Rss className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">No news yet</p>
                        <p className="text-sm">Add some feeds to get started</p>
                        <Button
                            variant="outline"
                            className="mt-4 border-neutral-700 hover:bg-neutral-800"
                            onClick={() => setAddFeedOpen(true)}
                        >
                            Add Feed
                        </Button>
                    </div>
                ) : (
                    <ScrollArea className="flex-1">
                        <div className="p-6">
                            <NewsStream items={filteredItems} viewType={viewType} />
                        </div>
                    </ScrollArea>
                )}
            </div>

            <AddFeedDialog
                open={addFeedOpen}
                onOpenChange={setAddFeedOpen}
                onFeedAdded={(feed) => {
                    setFeeds([feed, ...feeds]);
                    refreshItems([feed]); // Optimistically fetch just this one? Or re-fetch all?
                    // For simplicity, re-fetch all or correct implementation would be to fetch just one and append
                    // But refreshing all ensures correct sort.
                    refreshItems([feed, ...feeds]);
                }}
            />

            <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-neutral-900 border-neutral-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            Daily Briefing
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            AI-generated summary of your current feed
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-4">
                        {generatingSummary ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                                <p className="text-neutral-400">Reading the news...</p>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none">
                                {summaryText.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2">{line}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
