"use client";

import React, { useState } from "react";
import { DatabaseProperty } from "@/types";
import { extractTagsFromRows, generateTagData, parseTagInput } from "@/lib/convert-to-tags";
import { Button } from "@/components/ui/button";
import { X, Scissors, Loader2 } from "lucide-react";
import { splitTagsInDatabase } from "@/actions/split-tags";

interface SplitTagsDialogProps {
  property: DatabaseProperty;
  rowsData: any[];
  databaseId: string;
  onComplete?: () => void;
  onClose: () => void;
}

export function SplitTagsDialog({
  property,
  rowsData,
  databaseId,
  onComplete,
  onClose,
}: SplitTagsDialogProps) {
  const [isSplitting, setIsSplitting] = useState(false);

  // Extract current tags
  const currentTags = extractTagsFromRows(rowsData, property.id);

  // Check which tags contain commas
  const tagsWithCommas = currentTags.filter(tag => tag.includes(',') || tag.includes(';') || tag.includes('|'));

  // Preview what the split will produce
  const allSplitTags = new Set<string>();
  tagsWithCommas.forEach(tag => {
    const split = parseTagInput(tag);
    split.forEach(t => allSplitTags.add(t));
  });

  const splitTagsArray = Array.from(allSplitTags);
  const tagData = generateTagData(splitTagsArray);

  const handleSplit = async () => {
    setIsSplitting(true);
    try {
      const result = await splitTagsInDatabase(databaseId, property.id);

      if (result.success) {
        alert(result.message);
        if (onComplete) {
          onComplete();
        }
        onClose();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error splitting tags:", error);
      alert("Failed to split tags. Please try again.");
    } finally {
      setIsSplitting(false);
    }
  };

  if (tagsWithCommas.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
        <div
          className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-neutral-600" />
              <h2 className="text-xl font-semibold text-neutral-900">
                Split Tags
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-900">
              ✓ No comma-separated tags found! All tags are already separated.
            </p>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={onClose}
              className="text-neutral-700"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-neutral-900">
              Split Comma-Separated Tags
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm text-neutral-600 mb-2">
            Found <span className="font-semibold">{tagsWithCommas.length}</span> tag{tagsWithCommas.length !== 1 ? 's' : ''} containing commas that will be split into{" "}
            <span className="font-semibold">{splitTagsArray.length}</span> separate tag{splitTagsArray.length !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* Before/After Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Before */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">
              Before (with commas):
            </h3>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-2 max-h-[200px] overflow-y-auto">
              {tagsWithCommas.map((tag, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-white rounded text-sm text-neutral-900 border border-red-300"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">
              After (separated):
            </h3>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-2 max-h-[200px] overflow-y-auto">
              {tagData.map((tag) => (
                <div
                  key={tag.id}
                  className="inline-block mr-2 mb-2 px-3 py-1.5 rounded text-sm text-neutral-900 font-medium"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">
            <strong>Warning:</strong> This operation will split all tags containing commas (`,`), semicolons (`;`),
            or pipes (`|`) into separate tag entities. This affects all rows in the database and cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-neutral-700"
            disabled={isSplitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSplit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSplitting}
          >
            {isSplitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Splitting...
              </>
            ) : (
              <>
                <Scissors className="h-4 w-4 mr-2" />
                Split Tags
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
