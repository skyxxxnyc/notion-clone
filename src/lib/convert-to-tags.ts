/**
 * Utility to convert multiSelect properties to tags properties
 * and generate tag data from existing values
 */

import { DatabaseProperty, DatabaseRow } from "@/types";

/**
 * Convert a multiSelect property to tags property type
 */
export function convertPropertyToTags(property: DatabaseProperty): DatabaseProperty {
  if (property.type !== "multiSelect" && property.type !== "select") {
    throw new Error(`Cannot convert ${property.type} to tags. Only select/multiSelect can be converted.`);
  }

  return {
    ...property,
    type: "tags",
    // Remove options since tags don't use predefined options
    options: undefined,
  };
}

/**
 * Extract all unique tag values from rows for a given property
 */
export function extractTagsFromRows(
  rows: DatabaseRow[],
  propertyId: string
): string[] {
  const tagsSet = new Set<string>();

  rows.forEach((row) => {
    const value = row.properties[propertyId];

    if (Array.isArray(value)) {
      // Already an array of tags
      value.forEach((tag) => {
        if (typeof tag === 'string' && tag.trim()) {
          tagsSet.add(tag.trim());
        }
      });
    } else if (typeof value === 'string' && value.trim()) {
      // Single value
      tagsSet.add(value.trim());
    }
  });

  return Array.from(tagsSet).sort();
}

/**
 * Generate tag data structure with colors for each unique tag
 */
export function generateTagData(tags: string[]) {
  return tags.map((tag) => {
    // Generate consistent color based on tag name
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = Math.abs(hash) % 360;

    return {
      id: tag,
      name: tag,
      color: `hsl(${hue}, 70%, 80%)`,
    };
  });
}

/**
 * Convert all rows data from multiSelect/select format to tags format
 */
export function convertRowDataToTags(
  rows: DatabaseRow[],
  propertyId: string
): DatabaseRow[] {
  return rows.map((row) => {
    const value = row.properties[propertyId];
    let tagArray: string[] = [];

    if (Array.isArray(value)) {
      // Already array, just ensure strings
      tagArray = value.filter((v) => typeof v === 'string' && v.trim());
    } else if (typeof value === 'string' && value.trim()) {
      // Convert single value to array
      tagArray = [value.trim()];
    }

    return {
      ...row,
      properties: {
        ...row.properties,
        [propertyId]: tagArray,
      },
    };
  });
}

/**
 * Full migration: Convert property and all row data from multiSelect to tags
 */
export function migrateToTags(
  property: DatabaseProperty,
  rows: DatabaseRow[]
): {
  property: DatabaseProperty;
  rows: DatabaseRow[];
  tags: Array<{ id: string; name: string; color: string }>;
} {
  // Convert property
  const newProperty = convertPropertyToTags(property);

  // Extract and generate tags
  const uniqueTags = extractTagsFromRows(rows, property.id);
  const tags = generateTagData(uniqueTags);

  // Convert row data
  const newRows = convertRowDataToTags(rows, property.id);

  return {
    property: newProperty,
    rows: newRows,
    tags,
  };
}

/**
 * Create tags from a comma-separated or array of values
 */
export function parseTagInput(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  // Split by comma, semicolon, or pipe
  return input
    .split(/[,;|]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/**
 * Get tag color for a specific tag name (consistent across app)
 */
export function getTagColor(tagName: string): string {
  const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 80%)`;
}

/**
 * Suggest tags based on content analysis (simple keyword extraction)
 */
export function suggestTags(content: string, maxTags: number = 5): string[] {
  // Simple implementation - extract capitalized words and common keywords
  const words = content.split(/\s+/);
  const candidates = new Set<string>();

  words.forEach((word) => {
    // Remove punctuation
    const cleaned = word.replace(/[^\w]/g, '');

    // Add capitalized words (potential proper nouns)
    if (cleaned.length > 3 && /^[A-Z]/.test(cleaned)) {
      candidates.add(cleaned);
    }
  });

  return Array.from(candidates).slice(0, maxTags);
}
