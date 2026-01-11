"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Image,
  Minus,
  Link,
  Sparkles,
  Upload,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateContent } from "@/actions/ai";

interface SlashCommandMenuProps {
  editor: Editor;
}

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: Editor) => void;
  keywords: string[];
}

const commands: CommandItem[] = [
  {
    title: "Ask AI",
    description: "Generate content with AI",
    icon: <Sparkles className="h-4 w-4 text-purple-500" />,
    keywords: ["ai", "gpt", "generate", "ask", "magic"],
    command: async (editor) => {
      const prompt = window.prompt("What should I write?");
      if (prompt) {
        // Disable editing to prevent conflicts
        editor.setEditable(false);

        // Insert a loading placeholder
        editor.chain().insertContent("<p>✨ Generating...</p>").run();

        try {
          const content = await generateContent(prompt);

          // Revert the placeholder state
          editor.chain().undo().run();

          if (content) {
            editor.chain().focus().insertContent(content).run();
          }
        } catch (error) {
          editor.chain().undo().run();
          alert("AI Error: " + (error as Error).message);
        } finally {
          editor.setEditable(true);
        }
      }
    },
  },
  {
    title: "Text",
    description: "Just start writing with plain text",
    icon: <Type className="h-4 w-4" />,
    keywords: ["text", "paragraph", "plain"],
    command: (editor) => {
      editor.chain().focus().setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: <Heading1 className="h-4 w-4" />,
    keywords: ["heading", "h1", "title", "large"],
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 className="h-4 w-4" />,
    keywords: ["heading", "h2", "subtitle", "medium"],
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: <Heading3 className="h-4 w-4" />,
    keywords: ["heading", "h3", "small"],
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: <List className="h-4 w-4" />,
    keywords: ["list", "bullet", "unordered", "ul"],
    command: (editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: <ListOrdered className="h-4 w-4" />,
    keywords: ["list", "numbered", "ordered", "ol"],
    command: (editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list",
    icon: <CheckSquare className="h-4 w-4" />,
    keywords: ["todo", "task", "checkbox", "check"],
    command: (editor) => {
      editor.chain().focus().toggleTaskList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote",
    icon: <Quote className="h-4 w-4" />,
    keywords: ["quote", "blockquote", "citation"],
    command: (editor) => {
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Capture a code snippet",
    icon: <Code className="h-4 w-4" />,
    keywords: ["code", "codeblock", "snippet", "programming"],
    command: (editor) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
  },
  {
    title: "Divider",
    description: "Visually divide content",
    icon: <Minus className="h-4 w-4" />,
    keywords: ["divider", "separator", "hr", "line"],
    command: (editor) => {
      editor.chain().focus().setHorizontalRule().run();
    },
  },
  {
    title: "Image",
    description: "Upload or embed an image",
    icon: <Image className="h-4 w-4" />,
    keywords: ["image", "picture", "photo", "media"],
    command: (editor) => {
      const url = window.prompt("Enter image URL:");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
  },
  {
    title: "File Upload",
    description: "Upload files and attachments",
    icon: <Upload className="h-4 w-4" />,
    keywords: ["file", "upload", "attachment", "document", "pdf"],
    command: (editor) => {
      // Insert a placeholder for file upload component
      editor.chain().focus().insertContent('<div class="file-upload-block" data-type="file-upload"></div>').run();
    },
  },
  {
    title: "Image Gallery",
    description: "Create a gallery of images",
    icon: <Images className="h-4 w-4" />,
    keywords: ["gallery", "images", "photos", "pictures", "carousel"],
    command: (editor) => {
      // Insert a placeholder for image gallery component
      editor.chain().focus().insertContent('<div class="image-gallery-block" data-type="image-gallery"></div>').run();
    },
  },
  {
    title: "Link",
    description: "Add a hyperlink",
    icon: <Link className="h-4 w-4" />,
    keywords: ["link", "url", "hyperlink"],
    command: (editor) => {
      const url = window.prompt("Enter URL:");
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    },
  },
];

export function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = commands.filter((item) => {
    const searchQuery = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      item.keywords.some((keyword) => keyword.includes(searchQuery))
    );
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev <= 0 ? filteredCommands.length - 1 : prev - 1
          );
          break;
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev >= filteredCommands.length - 1 ? 0 : prev + 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            // Delete the slash and query
            const { from } = editor.state.selection;
            const textBefore = editor.state.doc.textBetween(
              Math.max(0, from - query.length - 1),
              from,
              " "
            );
            const slashIndex = textBefore.lastIndexOf("/");
            if (slashIndex !== -1) {
              editor
                .chain()
                .deleteRange({
                  from: from - query.length - 1,
                  to: from,
                })
                .run();
            }
            filteredCommands[selectedIndex].command(editor);
            setIsOpen(false);
            setQuery("");
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setQuery("");
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex, editor, query]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handleUpdate = () => {
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 50),
        from,
        " "
      );

      const slashIndex = textBefore.lastIndexOf("/");

      if (slashIndex !== -1) {
        const afterSlash = textBefore.slice(slashIndex + 1);
        // Only show menu if there's no space after the slash
        if (!afterSlash.includes(" ")) {
          setQuery(afterSlash);
          setIsOpen(true);
          setSelectedIndex(0);

          // Calculate position
          const coords = editor.view.coordsAtPos(from);
          setPosition({
            top: coords.bottom + 8,
            left: coords.left,
          });
        } else {
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
      }
    };

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  if (!isOpen || filteredCommands.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 bg-[#0a0a0a] rounded-lg shadow-lg border border-[#333] overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="p-2 text-xs text-neutral-500 border-b border-[#333]">
        Basic blocks
      </div>
      <div className="max-h-80 overflow-y-auto">
        {filteredCommands.map((item, index) => (
          <button
            key={item.title}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-900 transition-colors",
              index === selectedIndex && "bg-neutral-900"
            )}
            onClick={() => {
              const { from } = editor.state.selection;
              editor
                .chain()
                .deleteRange({
                  from: from - query.length - 1,
                  to: from,
                })
                .run();
              item.command(editor);
              setIsOpen(false);
              setQuery("");
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded bg-[#0a0a0a] border border-[#333]">
              {item.title === "Ask AI" ? (
                <Sparkles className="h-4 w-4 text-[#ccff00]" />
              ) : (
                React.cloneElement(item.icon as any, { className: "h-4 w-4 text-neutral-400" })
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-200">
                {item.title}
              </div>
              <div className="text-xs text-neutral-500">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
