"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { SuggestionMenuController, getDefaultReactSlashMenuItems, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { convertAppBlocksToBlockNote, convertBlockNoteToAppBlocks } from "@/lib/block-conversion";
import { useEffect, useMemo, useState } from "react";
import { uploadCoverImage } from "@/actions/storage";
import { generateContent } from "@/actions/ai";
import { Sparkles } from "lucide-react";
// import { filterSuggestionItems } from "@blocknote/react";

const filterSuggestionItems = (items: any[], query: string) => {
    return items.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.aliases && item.aliases.some((a: string) => a.toLowerCase().includes(query.toLowerCase())))
    );
};

interface BlockNoteEditorProps {
    initialBlocks: any[]; // App blocks
    onChange: (blocks: any[]) => void;
    editable?: boolean;
}

export function BlockNoteEditor({ initialBlocks, onChange, editable = true }: BlockNoteEditorProps) {
    // Simple theme detection (can be improved)
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        // Check if document has dark class
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "dark" : "light");

        // Optional: Observe class changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    const isDark = document.documentElement.classList.contains("dark");
                    setTheme(isDark ? "dark" : "light");
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // Convert app blocks to BlockNote blocks
    const initialContent = useMemo(() => {
        return convertAppBlocksToBlockNote(initialBlocks || []);
    }, []); // Only on mount

    const editor = useCreateBlockNote({
        initialContent: initialContent.length > 0 ? initialContent : undefined,
        uploadFile: async (file) => {
            try {
                return await uploadCoverImage(file);
            } catch (error) {
                console.error("Upload failed:", error);
                return URL.createObjectURL(file); // Fallback
            }
        },
        defaultStyles: true,
    });

    const getCustomSlashMenuItems = (editor: any) => {
        const aiItem = {
            title: "Ask AI",
            onItemClick: async () => {
                const prompt = window.prompt("Ask AI:");
                if (!prompt) return;

                // Insert loading state
                // editor.insertBlocks([{ type: "paragraph", content: "✨ Generating..." }], editor.getTextCursorPosition().block, "after");
                // Simplified: just wait then insert

                try {
                    const generated = await generateContent(prompt);
                    if (generated) {
                        // Insert generated text
                        // We can try to parse it or just insert as text
                        editor.insertBlocks(
                            [{ type: "paragraph", content: generated }],
                            editor.getTextCursorPosition().block,
                            "after"
                        );
                    }
                } catch (e) {
                    alert("AI Failed");
                }
            },
            aliases: ["ai", "gpt", "generate"],
            group: "AI",
            icon: <Sparkles size={18} />,
            subtext: "Generate content with AI",
        };

        return [aiItem, ...getDefaultReactSlashMenuItems(editor)];
    };

    const handleChange = () => {
        if (editor) {
            const appBlocks = convertBlockNoteToAppBlocks(editor.document);
            onChange(appBlocks);
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="blocknote-editor-wrapper">
            <BlockNoteView
                editor={editor}
                editable={editable}
                theme={theme}
                onChange={handleChange}
                className="min-h-[500px]"
                slashMenu={false}
                data-theming-css-variables
            >
                <SuggestionMenuController
                    triggerCharacter={"/"}
                    getItems={async (query) =>
                        filterSuggestionItems(getCustomSlashMenuItems(editor), query)
                    }
                />
            </BlockNoteView>
        </div>
    );
}
