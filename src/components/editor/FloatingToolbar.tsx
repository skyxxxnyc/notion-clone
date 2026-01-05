"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  editor: Editor;
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updateToolbar = useCallback(() => {
    const { selection } = editor.state;
    const { from, to, empty } = selection;

    if (empty) {
      setIsVisible(false);
      return;
    }

    // Get the selection coordinates
    const { view } = editor;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // Position the toolbar above the selection
    setPosition({
      top: start.top - 50,
      left: (start.left + end.left) / 2,
    });
    setIsVisible(true);
  }, [editor]);

  useEffect(() => {
    editor.on("selectionUpdate", updateToolbar);
    editor.on("focus", updateToolbar);
    editor.on("blur", () => setIsVisible(false));

    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("focus", updateToolbar);
      editor.off("blur", () => setIsVisible(false));
    };
  }, [editor, updateToolbar]);

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 bg-white rounded-lg shadow-lg border border-neutral-200 p-1"
      style={{
        top: position.top,
        left: position.left,
        transform: "translateX(-50%)",
      }}
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        tooltip="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        tooltip="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        tooltip="Underline"
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        tooltip="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        tooltip="Inline Code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-5 bg-neutral-200 mx-1" />

      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive("link")}
        tooltip="Link"
      >
        <Link className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
        tooltip="Highlight"
      >
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>

      <div className="w-px h-5 bg-neutral-200 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        tooltip="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        tooltip="Align Centre"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        tooltip="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  tooltip,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded hover:bg-neutral-100 transition-colors",
        isActive && "bg-neutral-100 text-blue-600"
      )}
      title={tooltip}
    >
      {children}
    </button>
  );
}
