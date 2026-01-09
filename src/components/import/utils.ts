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
