"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Page } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmilePlus, Image, MessageSquare, X } from "lucide-react";

interface PageHeaderProps {
  page: Page;
  onTitleChange: (title: string) => void;
  onIconChange: (icon: string) => void;
  onCoverChange: (cover: string | undefined) => void;
}

const EMOJI_LIST = [
  "📄", "📝", "📋", "📌", "📎", "✏️", "🖊️", "🖋️",
  "📚", "📖", "📕", "📗", "📘", "📙", "📓", "📒",
  "💡", "🎯", "🚀", "⭐", "🌟", "💫", "✨", "🔥",
  "💻", "🖥️", "⌨️", "🖱️", "💾", "📱", "📲", "🔧",
  "🏠", "🏢", "🏗️", "🏭", "🏪", "🏬", "🏰", "🗼",
  "🎨", "🎭", "🎪", "🎢", "🎡", "🎠", "🎬", "🎤",
  "🎵", "🎶", "🎸", "🎹", "🎺", "🎻", "🥁", "🎧",
  "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱",
  "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓",
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
];

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1557682268-e3955ed5d83f?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&h=400&fit=crop",
];

export function PageHeader({
  page,
  onTitleChange,
  onIconChange,
  onCoverChange,
}: PageHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsEditingTitle(false);
    }
    if (e.key === "Escape") {
      setIsEditingTitle(false);
    }
  };

  return (
    <div>
      {/* Cover Image */}
      {page.coverImage && (
        <div className="relative -mx-16 -mt-12 mb-8 h-48 overflow-hidden group">
          <img
            src={page.coverImage}
            alt="Page cover"
            className="w-full h-full object-cover"
            style={{ objectPosition: `center ${page.coverPosition || 50}%` }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors">
            <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCoverPicker(true)}
              >
                Change cover
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCoverChange(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Icon and Title */}
      <div className="group">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!page.icon && (
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-500"
              onClick={() => setShowIconPicker(true)}
            >
              <SmilePlus className="h-4 w-4 mr-1" />
              Add icon
            </Button>
          )}
          {!page.coverImage && (
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-500"
              onClick={() => setShowCoverPicker(true)}
            >
              <Image className="h-4 w-4 mr-1" />
              Add cover
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-neutral-500">
            <MessageSquare className="h-4 w-4 mr-1" />
            Add comment
          </Button>
        </div>

        {/* Icon */}
        {page.icon && (
          <Popover open={showIconPicker} onOpenChange={setShowIconPicker}>
            <PopoverTrigger asChild>
              <button className="text-6xl mb-4 hover:bg-neutral-100 rounded p-1 transition-colors">
                {page.icon}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Emoji</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onIconChange("");
                    setShowIconPicker(false);
                  }}
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    className="p-2 text-xl hover:bg-neutral-100 rounded transition-colors"
                    onClick={() => {
                      onIconChange(emoji);
                      setShowIconPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {!page.icon && showIconPicker && (
          <Popover open={showIconPicker} onOpenChange={setShowIconPicker}>
            <PopoverTrigger asChild>
              <span />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <div className="text-sm font-medium mb-3">Emoji</div>
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    className="p-2 text-xl hover:bg-neutral-100 rounded transition-colors"
                    onClick={() => {
                      onIconChange(emoji);
                      setShowIconPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Title */}
        {isEditingTitle ? (
          <textarea
            ref={titleRef}
            value={page.title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={handleTitleKeyDown}
            className="w-full text-4xl font-bold text-neutral-900 bg-transparent border-none outline-none resize-none overflow-hidden"
            placeholder="Untitled"
            rows={1}
          />
        ) : (
          <h1
            className="text-4xl font-bold text-neutral-900 cursor-text hover:bg-neutral-50 rounded px-1 -mx-1 transition-colors"
            onClick={() => setIsEditingTitle(true)}
          >
            {page.title || "Untitled"}
          </h1>
        )}
      </div>

      {/* Cover Picker Dialog */}
      {showCoverPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCoverPicker(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add cover</h3>
              <Button
                variant="ghost"
                size="iconSm"
                onClick={() => setShowCoverPicker(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {COVER_IMAGES.map((url, index) => (
                <button
                  key={index}
                  className="aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                  onClick={() => {
                    onCoverChange(url);
                    setShowCoverPicker(false);
                  }}
                >
                  <img
                    src={url}
                    alt={`Cover ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const url = window.prompt("Enter image URL:");
                    if (url) {
                      onCoverChange(url);
                      setShowCoverPicker(false);
                    }
                  }}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Add from URL
                </Button>

                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        // For now, use a data URL (client-side)
                        // In production, you'd upload to Supabase Storage
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          onCoverChange(dataUrl);
                          setShowCoverPicker(false);
                        };
                        reader.readAsDataURL(file);
                      } catch (error) {
                        alert("Failed to upload image");
                      }
                    }}
                  />
                  <Button variant="outline" type="button">
                    <Image className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
