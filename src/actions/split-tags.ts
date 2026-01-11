"use server";

import { createClient } from "@/lib/supabase-server";
import { splitCommaSeparatedTags } from "@/lib/convert-to-tags";
import { DatabaseRow } from "@/types";

/**
 * Split comma-separated tags in all rows for a given property
 */
export async function splitTagsInDatabase(
  databaseId: string,
  propertyId: string
): Promise<{ success: boolean; message: string; affectedRows: number }> {
  try {
    const supabase = await createClient();

    // Get all pages (rows) in this database
    const { data: pages, error: fetchError } = await supabase
      .from("pages")
      .select("*")
      .eq("parent_id", databaseId)
      .eq("is_archived", false);

    if (fetchError) {
      console.error("Error fetching pages:", fetchError);
      return {
        success: false,
        message: "Failed to fetch database rows",
        affectedRows: 0,
      };
    }

    if (!pages || pages.length === 0) {
      return {
        success: true,
        message: "No rows found in database",
        affectedRows: 0,
      };
    }

    // Convert to DatabaseRow format
    const rows: DatabaseRow[] = pages.map((page) => ({
      id: page.id,
      pageId: page.id,
      databaseId: databaseId,
      properties: page.properties || {},
      createdAt: page.created_at,
      updatedAt: page.updated_at,
      createdBy: page.created_by,
      lastEditedBy: page.last_edited_by,
    }));

    // Split tags
    const updatedRows = splitCommaSeparatedTags(rows, propertyId);

    // Track how many rows were actually changed
    let affectedCount = 0;

    // Update each row in the database
    for (let i = 0; i < updatedRows.length; i++) {
      const updatedRow = updatedRows[i];
      const originalRow = rows[i];

      // Check if the properties actually changed
      const originalTags = JSON.stringify(originalRow.properties[propertyId]);
      const updatedTags = JSON.stringify(updatedRow.properties[propertyId]);

      if (originalTags !== updatedTags) {
        affectedCount++;

        const { error: updateError } = await supabase
          .from("pages")
          .update({
            properties: updatedRow.properties,
            updated_at: new Date().toISOString(),
          })
          .eq("id", updatedRow.pageId);

        if (updateError) {
          console.error(`Error updating page ${updatedRow.pageId}:`, updateError);
        }
      }
    }

    return {
      success: true,
      message: `Successfully split tags in ${affectedCount} row${affectedCount !== 1 ? "s" : ""}`,
      affectedRows: affectedCount,
    };
  } catch (error) {
    console.error("Error splitting tags:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      affectedRows: 0,
    };
  }
}
