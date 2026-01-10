"use client";

import React, { useState } from "react";
import { DatabaseProperty } from "@/types";
import { extractTagsFromRows, generateTagData, getTagColor } from "@/lib/convert-to-tags";
import { Button } from "@/components/ui/button";
import { X, Tag } from "lucide-react";

interface ConvertToTagsDialogProps {
  property: DatabaseProperty;
  rowsData: any[];
  onConvert: (propertyId: string) => void;
  onClose: () => void;
}

export function ConvertToTagsDialog({
  property,
  rowsData,
  onConvert,
  onClose,
}: ConvertToTagsDialogProps) {
  const [step, setStep] = useState<"preview" | "confirm">("preview");

  // Extract unique tags from existing data
  const uniqueTags = extractTagsFromRows(rowsData, property.id);
  const tagData = generateTagData(uniqueTags);

  const handleConvert = () => {
    onConvert(property.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-neutral-900">
              Convert to Tags Property
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
            Converting "{property.name}" from <span className="font-medium">{property.type}</span> to{" "}
            <span className="font-medium">tags</span> will:
          </p>
          <ul className="text-sm text-neutral-600 space-y-1 ml-4">
            <li>• Remove predefined options (tags are created on-the-fly)</li>
            <li>• Auto-generate unique colors for each tag</li>
            <li>• Preserve all existing values as tags</li>
            <li>• Allow adding new tags without configuration</li>
          </ul>
        </div>

        {/* Preview Tags */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            Preview: {uniqueTags.length} unique tag{uniqueTags.length !== 1 ? "s" : ""} found
          </h3>

          {uniqueTags.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              {tagData.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-block px-3 py-1.5 rounded text-sm text-neutral-900 font-medium"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-center">
              <p className="text-sm text-neutral-500">
                No tags found in existing data. Tags can be added later.
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Tags will auto-generate consistent colors based on their names.
            You can add new tags simply by typing and pressing Enter - no configuration needed!
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-neutral-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Tag className="h-4 w-4 mr-2" />
            Convert to Tags
          </Button>
        </div>
      </div>
    </div>
  );
}
