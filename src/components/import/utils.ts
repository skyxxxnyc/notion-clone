import Papa from "papaparse";
// import matter from "gray-matter"; // Removed to avoid Buffer issues in browser
import { ImportData, ImportField, ImportType } from "./types";

export async function parseFile(file: File): Promise<ImportData> {
    const content = await file.text();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
        return parseCSV(content, file);
    } else if (extension === 'json') {
        return parseJSON(content, file);
    } else if (['md', 'markdown'].includes(extension || '')) {
        return parseMD(content, file);
    }

    throw new Error('Unsupported file type');
}

function parseCSV(content: string, file: File): ImportData {
    const result = Papa.parse(content, { header: true, skipEmptyLines: true });

    if (result.errors.length > 0) {
        console.warn("CSV parse errors:", result.errors);
    }

    const rows = result.data as any[];
    const fields: ImportField[] = result.meta.fields
        ? result.meta.fields.map(field => ({
            key: field,
            sample: rows[0]?.[field]
        }))
        : [];

    return {
        fileName: file.name,
        fileType: 'csv',
        fields,
        rows,
        originalFile: file
    };
}

function parseJSON(content: string, file: File): ImportData {
    try {
        const raw = JSON.parse(content);
        let rows: any[] = [];

        if (Array.isArray(raw)) {
            rows = raw;
        } else {
            // If object, wrapped in array
            rows = [raw];
        }

        // Extract all unique keys
        const allKeys = new Set<string>();
        rows.forEach(row => {
            Object.keys(row).forEach(k => allKeys.add(k));
        });

        const fields: ImportField[] = Array.from(allKeys).map(key => ({
            key,
            sample: rows[0]?.[key]
        }));

        return {
            fileName: file.name,
            fileType: 'json',
            fields,
            rows,
            originalFile: file
        };
    } catch (e) {
        throw new Error("Invalid JSON file");
    }
}

function parseMD(content: string, file: File): ImportData {
    try {
        // Simple frontmatter parser
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);

        let data: Record<string, any> = {};
        let body = content;

        if (match) {
            const yamlBlock = match[1];
            body = match[2];

            // Basic YAML parsing
            yamlBlock.split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex !== -1) {
                    const key = line.slice(0, colonIndex).trim();
                    let value = line.slice(colonIndex + 1).trim();

                    // Remove quotes
                    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }

                    // Type inference
                    if (value === 'true') data[key] = true;
                    else if (value === 'false') data[key] = false;
                    else if (!isNaN(Number(value)) && value !== '') data[key] = Number(value);
                    else data[key] = value;
                }
            });
        }

        const fields: ImportField[] = Object.keys(data).map(key => ({
            key,
            sample: data[key]
        }));

        return {
            fileName: file.name,
            fileType: 'md',
            fields,
            rows: [{ ...data, content: body }], // Single row representing the file
            content: body,
            originalFile: file
        };
    } catch (e) {
        // Fallback
        return {
            fileName: file.name,
            fileType: 'md',
            fields: [],
            rows: [{ content }],
            content,
            originalFile: file
        };
    }
}

// Simple inline parser for bold, italic, code, link
function parseInline(text: string): string {
    let html = text
        // Bold: **text** or __text__
        .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
        // Italic: *text* or _text_
        .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')
        // Code: `text`
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Link: [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    return html;
}

export function markdownToBlocks(markdown: string): { type: string, content: string }[] {
    if (!markdown) return [];

    const blocks: { type: string, content: string }[] = [];
    const lines = markdown.split('\n');
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Handle Code Blocks
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                blocks.push({
                    type: 'code',
                    content: codeBlockContent.join('\n')
                });
                codeBlockContent = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
            }
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent.push(line);
            continue;
        }

        const trimmed = line.trim();
        if (!trimmed) continue;

        // Headers
        if (trimmed.startsWith('# ')) {
            blocks.push({ type: 'heading1', content: parseInline(trimmed.substring(2)) });
        } else if (trimmed.startsWith('## ')) {
            blocks.push({ type: 'heading2', content: parseInline(trimmed.substring(3)) });
        } else if (trimmed.startsWith('### ')) {
            blocks.push({ type: 'heading3', content: parseInline(trimmed.substring(4)) });
        }
        // Lists
        else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            blocks.push({ type: 'bulletList', content: parseInline(trimmed.substring(2)) });
        } else if (/^\d+\.\s/.test(trimmed)) {
            blocks.push({ type: 'numberedList', content: parseInline(trimmed.replace(/^\d+\.\s/, '')) });
        }
        // Todo
        else if (trimmed.startsWith('- [ ] ')) {
            blocks.push({ type: 'todoList', content: parseInline(trimmed.substring(6)) });
        } else if (trimmed.startsWith('- [x] ')) {
            // Checkbox logic handled by TipTap usually via data attributes, 
            // but for simple text import we just take the content.
            blocks.push({ type: 'todoList', content: parseInline(trimmed.substring(6)) });
        }
        // Blockquotes
        else if (trimmed.startsWith('> ')) {
            blocks.push({ type: 'quote', content: parseInline(trimmed.substring(2)) });
        }
        // Images: ![alt](url)
        else if (trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)) {
            const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (match) {
                // Block type 'image' usually expects content to be URL or complex object?
                // PageView seems to treat 'image' type content as src (line 119: content = node.attrs.src)
                blocks.push({ type: 'image', content: match[2] });
            }
        }
        // Horizontal Rule
        else if (trimmed === '---' || trimmed === '***') {
            blocks.push({ type: 'divider', content: '' });
        }
        // Default to Paragraph (text)
        else {
            blocks.push({ type: 'text', content: parseInline(trimmed) });
        }
    }

    if (inCodeBlock && codeBlockContent.length > 0) {
        blocks.push({
            type: 'code',
            content: codeBlockContent.join('\n')
        });
    }

    return blocks;
}
