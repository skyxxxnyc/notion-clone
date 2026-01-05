"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DragHandleProps {
  editor: Editor;
  className?: string;
}

export function DragHandle({ editor, className }: DragHandleProps) {
  const handleAddBlock = (type: string) => {
    switch (type) {
      case "text":
        editor.chain().focus().insertContent("<p></p>").run();
        break;
      case "h1":
        editor.chain().focus().insertContent("<h1></h1>").run();
        break;
      case "h2":
        editor.chain().focus().insertContent("<h2></h2>").run();
        break;
      case "h3":
        editor.chain().focus().insertContent("<h3></h3>").run();
        break;
      case "bullet":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "numbered":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "todo":
        editor.chain().focus().toggleTaskList().run();
        break;
      case "quote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "code":
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case "divider":
        editor.chain().focus().setHorizontalRule().run();
        break;
    }
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            title="Add block"
          >
            <Plus className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => handleAddBlock("text")}>
            Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddBlock("h1")}>
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddBlock("h2")}>
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddBlock("h3")}>
            Heading 3
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAddBlock("bullet")}>
            Bullet List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddBlock("numbered")}>
            Numbered List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddBlock("todo")}>
            To-do List
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAddBlock("quote")}>
            Quote
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddBlock("code")}>
            Code Block
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddBlock("divider")}>
            Divider
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors cursor-grab active:cursor-grabbing"
        title="Drag to move"
      >
        <GripVertical className="h-4 w-4" />
      </button>
    </div>
  );
}
