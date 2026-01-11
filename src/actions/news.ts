"use server";

import { createClient } from "@/lib/supabase-server";
import Parser from "rss-parser";
import { NewsFeed, NewsItem } from "@/types";

const parser = new Parser({
    customFields: {
        item: ["media:content", "media:thumbnail", "enclosure"],
    },
});

export async function getNewsFeeds() {
    const supabase = await createClient();
    const { data: feeds, error } = await supabase
        .from("news_feeds")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching news feeds:", error);
        return [];
    }

    return feeds as NewsFeed[];
}

export async function addNewsFeed(feed: Omit<NewsFeed, "id" | "userId" | "createdAt" | "icon">) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    // Generate an icon based on type if none provided
    let icon = "📰";
    if (feed.type === "reddit") icon = "🤖";
    if (feed.type === "topic") icon = "🔍";

    // Validate the feed URL by trying to parse it
    try {
        // If it's a reddit topic/subreddit, convert to RSS
        let url = feed.url;
        if (feed.type === "reddit" && !url.includes("rss")) {
            // simple check if it's a full url or just name
            if (!url.startsWith("http")) {
                url = `https://www.reddit.com/r/${url}/.rss`;
            } else if (!url.endsWith(".rss")) {
                url = `${url}/.rss`;
            }
        }

        if (feed.type === "topic" && !url.startsWith("http")) {
            url = `https://news.google.com/rss/search?q=${encodeURIComponent(feed.url)}&hl=en-US&gl=US&ceid=US:en`;
        }

        await parser.parseURL(url);

        // If successful, save the potentially modified URL
        const { data, error } = await supabase
            .from("news_feeds")
            .insert({
                ...feed,
                url,
                icon,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return data as NewsFeed;
    } catch (error) {
        console.error("Error creating feed:", error);
        throw new Error("Invalid RSS feed or unable to fetch");
    }
}

export async function deleteNewsFeed(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("news_feeds").delete().eq("id", id);
    if (error) throw error;
}

export async function fetchFeedItems(feeds: NewsFeed[]): Promise<NewsItem[]> {
    const allItems: NewsItem[] = [];

    // Fetch in parallel
    const promises = feeds.map(async (feed) => {
        try {
            const parsed = await parser.parseURL(feed.url);

            return parsed.items.map((item) => {
                // Extract an image if possible
                let thumbnail = "";
                if (item.enclosure?.url) thumbnail = item.enclosure.url;
                else if (item["media:content"]?.url) thumbnail = item["media:content"].url;
                else if (item["media:thumbnail"]?.url) thumbnail = item["media:thumbnail"].url;

                // Fallback for reddit thumbnails
                if (feed.type === "reddit" && item.content?.includes("<img src=")) {
                    const match = item.content.match(/<img src="([^"]+)"/);
                    if (match) thumbnail = match[1];
                }

                return {
                    // Ensure uniqueness across feeds by prefixing with feed ID
                    id: `${feed.id}-${item.guid || item.link || Math.random().toString()}`,
                    title: item.title || "Untitled",
                    link: item.link || "#",
                    pubDate: item.pubDate || new Date().toISOString(),
                    content: item.content,
                    contentSnippet: item.contentSnippet,
                    author: item.creator || (item as any).author,
                    thumbnail,
                    feedId: feed.id,
                    feedName: feed.name,
                    feedIcon: feed.icon,
                } as NewsItem;
            });
        } catch (e) {
            console.error(`Failed to fetch feed ${feed.name}:`, e);
            return [];
        }
    });

    const results = await Promise.all(promises);
    results.forEach(items => allItems.push(...items));

    // Sort by date descending
    return allItems.sort((a, b) =>
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
}
