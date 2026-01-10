"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { PageHeader } from "./PageHeader";
import { PageBreadcrumb } from "./PageBreadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/useDebounce";
import { DatabaseView } from "@/components/database/DatabaseView";
import { DatabasePageLayout } from "@/components/database/layout/DatabasePageLayout";
import {
  MessageSquare,
  Clock,
  Star,
  MoreHorizontal,
  Share,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AIToolbar,
  GeneratePageModal,
  GenerateTableModal,
  SmartSuggestions,
  type GeneratedPage,
  type GeneratedTable,
  type SmartSuggestion,
} from "@/components/ai";
import { PremiumPageView } from "./PremiumPageView";

interface PageViewProps {
  pageId: string;
}

export function PageView({ pageId }: PageViewProps) {
  const {
    pages,
    updatePage,
    toggleFavourite,
    duplicatePage,
    deletePage,
    setCurrentPage,
  } = useAppStore();

  const { fetchBlocks, savePageContent, saveStatus, setSaveStatus, createPage, createDatabase } = useAppStore();
  const page = pages[pageId];
  const parentPage = page?.parentId ? pages[page.parentId] : null;
  const isDatabaseItem = parentPage?.isDatabase;
  const [editorContent, setEditorContent] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  // AI Feature States
  const [selectedText, setSelectedText] = useState("");
  const [showPageModal, setShowPageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Show status indicator when it changes, and hide after 3 seconds if saved
  useEffect(() => {
    if (saveStatus !== "saved") {
      setShowStatus(true);
    } else {
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const debouncedSave = useDebounce(async (html: string, json: any) => {
    if (!json?.content) return;

    // Map Tiptap JSON nodes to our Block structure
    const mappedBlocks: any[] = json.content.map((node: any) => {
      let type: string = "text";
      let content: string = "";

      // Extract text content from node
      const extractText = (n: any): string => {
        if (n.text) return n.text;
        if (n.content) return n.content.map(extractText).join("");
        return "";
      };

      content = extractText(node);

      switch (node.type) {
        case "heading":
          type = node.attrs.level === 1 ? "heading1" : node.attrs.level === 2 ? "heading2" : "heading3";
          break;
        case "bulletList":
          type = "bulletList";
          break;
        case "orderedList":
          type = "numberedList";
          break;
        case "taskList":
          type = "todoList";
          break;
        case "blockquote":
          type = "quote";
          break;
        case "codeBlock":
          type = "code";
          break;
        case "horizontalRule":
          type = "divider";
          break;
        case "image":
          type = "image";
          content = node.attrs.src;
          break;
        default:
          type = "text";
      }

      return {
        type,
        content,
        parentId: null,
        properties: node.attrs || {},
      };
    });

    try {
      await savePageContent(pageId, mappedBlocks);
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, 1500);

  const handleContentChange = useCallback(
    (html: string, json?: any) => {
      setEditorContent(html);
      setSaveStatus("unsaved");
      debouncedSave(html, json);
    },
    [debouncedSave, setSaveStatus]
  );

  // Fetch blocks when page opens
  useEffect(() => {
    if (pageId) {
      setIsLoaded(false);
      fetchBlocks(pageId).then(() => {
        setIsLoaded(true);
      });
    }
  }, [pageId, fetchBlocks]);

  // Update editor content when page or blocks change
  useEffect(() => {
    if (page?.blocks && !isLoaded) { // Only set on initial load to avoid jumping during typing
      const html = page.blocks
        .map((block) => {
          switch (block.type) {
            case "heading1":
              return `<h1>${block.content}</h1>`;
            case "heading2":
              return `<h2>${block.content}</h2>`;
            case "heading3":
              return `<h3>${block.content}</h3>`;
            case "bulletList":
              return `<ul><li>${block.content}</li></ul>`;
            case "numberedList":
              return `<ol><li>${block.content}</li></ol>`;
            case "todoList":
              return `<ul data-type="taskList"><li data-type="taskItem"><label><input type="checkbox"><span>${block.content}</span></label></li></ul>`;
            case "quote":
              return `<blockquote>${block.content}</blockquote>`;
            case "code":
              return `<pre><code>${block.content}</code></pre>`;
            case "divider":
              return `<hr />`;
            case "image":
              return `<img src="${block.content}" alt="Image" />`;
            default:
              return `<p>${block.content}</p>`;
          }
        })
        .join("");
      setEditorContent(html || "<p></p>");
    }
  }, [page?.blocks, isLoaded]);

  const handleTitleChange = useCallback(
    (title: string) => {
      updatePage(pageId, { title });
    },
    [pageId, updatePage]
  );

  const handleIconChange = useCallback(
    (icon: string) => {
      updatePage(pageId, { icon });
    },
    [pageId, updatePage]
  );

  const handleCoverChange = useCallback(
    (coverImage: string | undefined) => {
      updatePage(pageId, { coverImage });
    },
    [pageId, updatePage]
  );

  const handleDuplicate = async () => {
    const newPage = await duplicatePage(pageId);
    setCurrentPage(newPage.id);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      await deletePage(pageId);
    }
  };

  // AI Feature Handlers
  const handleTextTransform = useCallback((newText: string) => {
    // Replace selected text in editor
    // This would need editor instance access - for now just update content
    setEditorContent(prev => prev.replace(selectedText, newText));
    setSelectedText("");
  }, [selectedText]);

  const handleGeneratePage = async (generatedPage: GeneratedPage) => {
    try {
      // Create new page with AI-generated content
      const newPage = await createPage(null, generatedPage.title);

      // Convert sections to HTML
      const html = generatedPage.sections.map(section => {
        let content = section.content;
        if (section.children) {
          content += section.children.map(child => {
            if (child.type === 'bulletList') {
              return `<ul>${child.content.split('\n').map(item => `<li>${item.replace(/^[•-]\s*/, '')}</li>`).join('')}</ul>`;
            }
            return `<p>${child.content}</p>`;
          }).join('');
        }

        switch (section.type) {
          case 'heading1': return `<h1>${content}</h1>`;
          case 'heading2': return `<h2>${content}</h2>`;
          case 'heading3': return `<h3>${content}</h3>`;
          case 'quote': return `<blockquote>${content}</blockquote>`;
          case 'callout': return `<div class="callout">${content}</div>`;
          default: return `<p>${content}</p>`;
        }
      }).join('');

      // Update page with icon and content
      if (generatedPage.icon) {
        await updatePage(newPage.id, { icon: generatedPage.icon });
      }

      // Navigate to new page
      setCurrentPage(newPage.id);
    } catch (error) {
      console.error('Failed to create page:', error);
      alert('Failed to create page. Please try again.');
    }
  };

  const handleGenerateTable = async (generatedTable: GeneratedTable) => {
    try {
      // Create database with AI-generated structure
      const newDb = await createDatabase(null, generatedTable.title);

      // Update database config with AI-generated properties
      const properties = [
        { id: 'title', name: 'Name', type: 'title' as const, isVisible: true, width: 250 },
        ...generatedTable.properties.map((prop, idx) => ({
          id: `prop_${idx}`,
          name: prop.name,
          type: prop.type as any,
          isVisible: true,
          width: 200,
          options: prop.options
        }))
      ];

      await updatePage(newDb.id, {
        databaseConfig: {
          properties,
          views: [{
            id: 'default',
            name: 'Table',
            type: 'table' as const,
            filters: [],
            sorts: [],
            visibleProperties: properties.map(p => p.id),
            config: {}
          }],
          defaultViewId: 'default'
        }
      });

      // TODO: Create rows with generated data
      // This would require bulk row creation

      // Navigate to new database
      setCurrentPage(newDb.id);
    } catch (error) {
      console.error('Failed to create database:', error);
      alert('Failed to create database. Please try again.');
    }
  };

  const handleApplySuggestion = useCallback((suggestion: SmartSuggestion) => {
    switch (suggestion.type) {
      case 'title':
        updatePage(pageId, { title: suggestion.value });
        break;
      case 'tag':
        // Add tag to page properties
        // This would need tag property support
        console.log('Add tag:', suggestion.value);
        break;
      case 'action':
        // Could create a new task or add to a list
        console.log('Action:', suggestion.value);
        break;
    }
  }, [pageId, updatePage]);

  if (!page || !isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Loading page...</p>
        </div>
      </div>
    );
  }

  // Check if page uses premium layout
  if (page.layout === "premium") {
    return <PremiumPageView pageId={pageId} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#0a0a0a]">
        <PageBreadcrumb pageId={pageId} />

        <div className="flex items-center gap-2">
          {/* AI Toolbar */}
          {!page.isDatabase && (
            <AIToolbar
              selectedText={selectedText}
              onTextTransform={handleTextTransform}
              onGeneratePage={() => setShowPageModal(true)}
              onGenerateTable={() => setShowTableModal(true)}
              onShowSuggestions={() => setShowSuggestions(true)}
            />
          )}

          {saveStatus === "saving" && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-500 animate-in fade-in duration-300">
              <div className="w-2 h-2 border border-neutral-600 border-t-neutral-400 rounded-full animate-spin" />
              Saving...
            </div>
          )}
          {saveStatus === "saved" && showStatus && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-green-500 animate-in fade-in slide-in-from-bottom-1 duration-300">
              <Check className="h-3 w-3" />
              Saved
            </div>
          )}
          {saveStatus === "unsaved" && (
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-amber-500">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-300 hover:text-neutral-100"
          >
            Share
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => toggleFavourite(pageId)}
            title={page.isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            <Star
              className={cn(
                "h-4 w-4",
                page.isFavourite && "fill-yellow-400 text-yellow-400"
              )}
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="iconSm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDuplicate}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Page history</DropdownMenuItem>
              <DropdownMenuItem>Page analytics</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Page Content */}
      <ScrollArea className="flex-1">
        {page.isDatabase ? (
          <DatabaseView page={page} />
        ) : isDatabaseItem ? (
          <DatabasePageLayout
            page={page}
            initialContent={editorContent}
            onContentChange={handleContentChange}
          />
        ) : (
          <div className="max-w-4xl mx-auto px-16 py-12">
            <PageHeader
              page={page}
              onTitleChange={handleTitleChange}
              onIconChange={handleIconChange}
              onCoverChange={handleCoverChange}
            />

            <div className="mt-8">
              <BlockEditor
                content={editorContent}
                onChange={handleContentChange}
                pageId={pageId}
                placeholder="Press '/' for commands, or just start typing..."
              />
            </div>
          </div>
        )}
      </ScrollArea>

      {/* AI Modals */}
      <GeneratePageModal
        isOpen={showPageModal}
        onClose={() => setShowPageModal(false)}
        onGenerate={handleGeneratePage}
      />

      <GenerateTableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onGenerate={handleGenerateTable}
      />

      <SmartSuggestions
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        context={{
          currentTitle: page.title,
          content: editorContent.replace(/<[^>]*>/g, '').slice(0, 500),
          pageType: page.isDatabase ? 'database' : 'page'
        }}
        onApplySuggestion={handleApplySuggestion}
      />
    </div>
  );
}
