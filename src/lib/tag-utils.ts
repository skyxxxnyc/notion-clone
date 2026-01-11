/**
 * Utility functions for tag management that can be called from anywhere
 */

import { splitTagsInDatabase } from "@/actions/split-tags";

/**
 * Split comma-separated tags in a database property
 *
 * @example
 * ```typescript
 * import { splitTags } from '@/lib/tag-utils';
 *
 * // In your component:
 * const handleSplitTags = async () => {
 *   const result = await splitTags(databaseId, propertyId);
 *   if (result.success) {
 *     console.log('Tags split successfully!');
 *     // Refresh your data here
 *   }
 * };
 * ```
 */
export async function splitTags(databaseId: string, propertyId: string) {
  return await splitTagsInDatabase(databaseId, propertyId);
}

/**
 * Export the SplitTagsDialog component for easy use
 */
export { SplitTagsDialog } from "@/components/database/SplitTagsDialog";
