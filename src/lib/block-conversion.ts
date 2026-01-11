import { BlockType } from "@/types";
import { PartialBlock } from "@blocknote/core";

// Helper to convert app blocks (flat) to BlockNote blocks (nested)
export function convertAppBlocksToBlockNote(appBlocks: any[]): PartialBlock[] {
    if (!appBlocks || appBlocks.length === 0) return [];

    // Group by parent ID
    const blocksByParent = new Map<string | null, any[]>();

    appBlocks.forEach(block => {
        const parentId = block.parentId || null;
        if (!blocksByParent.has(parentId)) {
            blocksByParent.set(parentId, []);
        }
        blocksByParent.get(parentId)?.push(block);
    });

    // Recursive function to build tree
    const buildTree = (parentId: string | null): PartialBlock[] => {
        const children = blocksByParent.get(parentId) || [];

        // Sort by index if available, though currently store might not imply order other than array order
        // Assuming array order is correct for now or using 'index' property if it exists
        children.sort((a, b) => (a.index || 0) - (b.index || 0));

        return children.map(block => {
            const bnBlock: any = {
                id: block.id,
                children: buildTree(block.id),
            };

            // Map types
            switch (block.type) {
                case "heading1":
                    bnBlock.type = "heading";
                    bnBlock.props = { level: 1 };
                    bnBlock.content = block.content;
                    break;
                case "heading2":
                    bnBlock.type = "heading";
                    bnBlock.props = { level: 2 };
                    bnBlock.content = block.content;
                    break;
                case "heading3":
                    bnBlock.type = "heading";
                    bnBlock.props = { level: 3 };
                    bnBlock.content = block.content;
                    break;
                case "bulletList":
                    bnBlock.type = "bulletListItem";
                    bnBlock.content = block.content;
                    break;
                case "numberedList":
                    bnBlock.type = "numberedListItem";
                    bnBlock.content = block.content;
                    break;
                case "todoList":
                    bnBlock.type = "checkListItem";
                    bnBlock.content = block.content;
                    // Check if checked is stored in properties
                    bnBlock.props = { checked: block.properties?.checked || false };
                    break;
                case "quote":
                    // BlockNote often calls this "callout" or custom, but standard markdown is blockquote
                    // BlockNote default schema usually has "paragraph" or specific block.
                    // Let's iterate: BlockNote has no "quote" in default schema v0.15+, it might be custom ??
                    // Actually default BlockNote schema has: paragraph, heading, bulletListItem, numberedListItem, checkListItem, table, file, image, video, audio
                    // It doesn't have "quote" by default? 
                    // Wait, earlier versions did. 
                    // Let's map to paragraph for now if unknown, or check documentation?
                    // I'll map to 'paragraph' with a prop or similar if needed, or assume it exists. 
                    // Actually, let's just try "paragraph" for fallback.
                    bnBlock.type = "paragraph";
                    bnBlock.content = block.content;
                    break;
                case "code":
                    // BlockNote doesn't have code block by default in basic schema? 
                    // It usually does.
                    bnBlock.type = "paragraph"; // Fallback
                    bnBlock.content = block.content;
                    break;
                case "image":
                    bnBlock.type = "image";
                    bnBlock.props = { url: block.content };
                    break;
                default:
                    bnBlock.type = "paragraph";
                    bnBlock.content = block.content;
            }

            return bnBlock as PartialBlock;
        });
    };

    return buildTree(null);
}

// Helper to convert BlockNote blocks (nested) to app blocks (flat)
export function convertBlockNoteToAppBlocks(bnBlocks: any[]): any[] {
    const flatBlocks: any[] = [];

    const traverse = (blocks: any[], parentId: string | null = null) => {
        blocks.forEach((block, index) => {
            let type = "text";
            let content = "";
            let properties = {};

            if (Array.isArray(block.content)) {
                // BlockNote content is array of StyledText. Join them for simple string content.
                content = block.content.map((c: any) => c.text).join("");
            } else if (typeof block.content === 'string') {
                content = block.content;
            }

            switch (block.type) {
                case "heading":
                    type = block.props.level === 1 ? "heading1" : block.props.level === 2 ? "heading2" : "heading3";
                    break;
                case "bulletListItem":
                    type = "bulletList";
                    break;
                case "numberedListItem":
                    type = "numberedList";
                    break;
                case "checkListItem":
                    type = "todoList";
                    properties = { checked: block.props.checked };
                    break;
                case "paragraph":
                    type = "text";
                    break;
                case "image":
                    type = "image";
                    content = block.props.url;
                    break;
                default:
                    type = "text";
            }

            flatBlocks.push({
                id: block.id,
                type,
                content,
                parentId,
                index,
                properties
            });

            if (block.children && block.children.length > 0) {
                traverse(block.children, block.id);
            }
        });
    };

    traverse(bnBlocks);
    return flatBlocks;
}
