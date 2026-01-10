"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addNewsFeed } from "@/actions/news";
import { NewsFeed } from "@/types";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AddFeedDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFeedAdded: (feed: NewsFeed) => void;
}

export function AddFeedDialog({ open, onOpenChange, onFeedAdded }: AddFeedDialogProps) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [type, setType] = useState<"rss" | "reddit" | "topic">("rss");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !url) return;

        setLoading(true);
        setError("");

        try {
            const newFeed = await addNewsFeed({
                name,
                url,
                type,
            });
            onFeedAdded(newFeed);
            onOpenChange(false);
            setName("");
            setUrl("");
            setType("rss");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to add feed. Please check the URL.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add News Source</DialogTitle>
                    <DialogDescription>
                        Add a new RSS feed, Subreddit, or Topic to your aggregator.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Source Type</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rss">RSS Feed</SelectItem>
                                <SelectItem value="reddit">Subreddit</SelectItem>
                                <SelectItem value="topic">Topic (Google News)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. TechCrunch, r/programming, AI News"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url">
                            {type === "rss" ? "RSS URL" : type === "reddit" ? "Subreddit Name" : "Topic Keyword"}
                        </Label>
                        <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder={
                                type === "rss"
                                    ? "https://..."
                                    : type === "reddit"
                                        ? "programming"
                                        : "Artificial Intelligence"
                            }
                            required
                        />
                        {type === "reddit" && <p className="text-xs text-neutral-500">Just the name, e.g. "webdev"</p>}
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Source
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
