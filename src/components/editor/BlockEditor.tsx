"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { cn } from "@/lib/utils";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { FloatingToolbar } from "./FloatingToolbar";
import { DragHandle } from "./DragHandle";

const lowlight = createLowlight(common);

interface BlockEditorProps {
  content: string;
  onChange: (content: string) => void;
  pageId: string;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function BlockEditor({
  content,
  onChange,
  pageId,
  placeholder = "Press '/' for commands...",
  className,
  editable = true,
}: BlockEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
          }
          return placeholder;
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "not-prose",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer hover:text-blue-800",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-neutral-900 text-neutral-100 rounded-lg p-4 font-mono text-sm",
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-neutral max-w-none focus:outline-none",
          "prose-headings:font-semibold prose-headings:text-neutral-900",
          "prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4",
          "prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3",
          "prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2",
          "prose-p:my-2 prose-p:leading-relaxed",
          "prose-ul:my-2 prose-ol:my-2",
          "prose-li:my-0.5",
          "prose-blockquote:border-l-4 prose-blockquote:border-neutral-300 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "min-h-[200px]"
        ),
      },
      handleKeyDown: (view, event) => {
        // Handle slash command
        if (event.key === "/" && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
          // Let the SlashCommandMenu handle this
          return false;
        }
        return false;
      },
    },
  });

  return (
    <div className={cn("relative", className)}>
      {editor && <FloatingToolbar editor={editor} />}
      {editor && <SlashCommandMenu editor={editor} />}
      <div className="group relative">
        {editor && editable && (
          <DragHandle
            className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
            editor={editor}
          />
        )}
        <EditorContent editor={editor} className="w-full" />
      </div>
    </div>
  );
}
