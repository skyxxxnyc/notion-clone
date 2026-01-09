"use server";

// Use Gemini if available, fallback to Perplexity
async function callGemini(systemPrompt: string, userPrompt: string, maxTokens: number = 1000) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) return null;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: maxTokens,
                    },
                }),
            }
        );

        if (!response.ok) {
            console.error("Gemini API error:", await response.text());
            return null;
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
        console.error("Gemini call failed:", error);
        return null;
    }
}

async function callPerplexity(systemPrompt: string, userPrompt: string, maxTokens: number = 1000) {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) return null;

    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.1-sonar-small-128k-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.2,
                max_tokens: maxTokens,
            }),
        });

        if (!response.ok) {
            console.error("Perplexity API error:", await response.text());
            return null;
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (error) {
        console.error("Perplexity call failed:", error);
        return null;
    }
}

async function generateWithAI(systemPrompt: string, userPrompt: string, maxTokens: number = 1000): Promise<string> {
    // Try Gemini first, then Perplexity
    let result = await callGemini(systemPrompt, userPrompt, maxTokens);

    if (!result) {
        result = await callPerplexity(systemPrompt, userPrompt, maxTokens);
    }

    if (!result) {
        throw new Error("No AI API key configured. Set GEMINI_API_KEY or PERPLEXITY_API_KEY in your environment.");
    }

    return result;
}

// Helper function to extract JSON from AI responses
function extractJSON(text: string): any {
    try {
        // Remove markdown code blocks
        let cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        // Try to find JSON object boundaries
        const jsonStart = cleaned.indexOf('{');
        const jsonEnd = cleaned.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }

        // Parse the JSON
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON extraction failed:", error);
        console.error("Raw text:", text);
        throw new Error("Failed to parse AI response as JSON");
    }
}


export async function generateContent(prompt: string) {
    const systemPrompt = "You are a helpful AI writing assistant embedded in a Notion-like editor. Generate clear, concise, and well-formatted HTML content (e.g. using <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>) based on the user's prompt. Do not include markdown code blocks or conversational filler. Return only the inner body HTML.";

    return generateWithAI(systemPrompt, prompt, 1000);
}

export async function generateCellContent(
    prompt: string,
    propertyType: string,
    propertyName: string,
    rowContext?: { title?: string; otherValues?: Record<string, any> }
) {
    // Build context message
    let contextMsg = "";
    if (rowContext?.title) {
        contextMsg += `Row title: "${rowContext.title}". `;
    }
    if (rowContext?.otherValues && Object.keys(rowContext.otherValues).length > 0) {
        contextMsg += `Other values: ${JSON.stringify(rowContext.otherValues)}. `;
    }

    // Type-specific instructions
    const typeInstructions: Record<string, string> = {
        text: "Return plain text only. No HTML, no formatting.",
        number: "Return only a single number. No text, no units.",
        date: "Return a date in YYYY-MM-DD format only.",
        url: "Return a valid URL only.",
        email: "Return a valid email address only.",
        phone: "Return a phone number only.",
        checkbox: "Return only 'true' or 'false'.",
        select: "Return a single short category/label (1-3 words).",
        multiSelect: "Return comma-separated short labels.",
        status: "Return a single status word like 'Todo', 'In Progress', or 'Done'.",
    };

    const typeInstruction = typeInstructions[propertyType] || typeInstructions.text;

    const systemPrompt = `You are filling in a database cell. The property is called "${propertyName}" (type: ${propertyType}). ${typeInstruction} Be concise and accurate. ${contextMsg}`;

    const result = await generateWithAI(systemPrompt, prompt, 200);
    let cleaned = result.trim();

    // Post-process based on type
    if (propertyType === "number") {
        const num = parseFloat(cleaned.replace(/[^0-9.-]/g, ""));
        return isNaN(num) ? null : num;
    }
    if (propertyType === "checkbox") {
        return cleaned.toLowerCase().includes("true");
    }

    return cleaned;
}

export interface RowData {
    rowId: string;
    title: string;
    properties: Record<string, any>;
}

export interface AutoFillColumnResult {
    rowId: string;
    value: any;
    error?: string;
}

/**
 * Auto-fills an entire column with AI-generated values based on other columns
 * @param propertyName - The name of the column to fill
 * @param propertyType - The type of the property
 * @param rows - Array of row data with existing values
 * @param instruction - User instruction for how to fill the column (e.g., "Summarize the title", "Calculate priority based on status and tags")
 * @param options - Additional options like which rows to skip
 * @returns Array of results for each row
 */
export async function autoFillColumn(
    propertyName: string,
    propertyType: string,
    rows: RowData[],
    instruction: string,
    options?: {
        skipExisting?: boolean; // Skip rows that already have a value
        propertyOptions?: any[]; // For select/multiSelect types
        batchSize?: number; // Process this many rows at a time (default: 5)
    }
): Promise<AutoFillColumnResult[]> {
    const { skipExisting = true, propertyOptions, batchSize = 5 } = options || {};

    // Type-specific instructions
    const typeInstructions: Record<string, string> = {
        text: "Return plain text only. No HTML, no formatting.",
        number: "Return only a single number. No text, no units.",
        date: "Return a date in YYYY-MM-DD format only.",
        url: "Return a valid URL only.",
        email: "Return a valid email address only.",
        phone: "Return a phone number only.",
        checkbox: "Return only 'true' or 'false'.",
        select: "Return a single short category/label (1-3 words).",
        multiSelect: "Return comma-separated short labels.",
        status: "Return a single status word like 'Todo', 'In Progress', or 'Done'.",
    };

    const typeInstruction = typeInstructions[propertyType] || typeInstructions.text;

    // Build context about the database structure
    const allPropertyNames = rows.length > 0 ? Object.keys(rows[0].properties).filter(key => key !== propertyName) : [];
    const contextInfo = `You are auto-filling the "${propertyName}" column (type: ${propertyType}) in a database. ${typeInstruction}

Available columns for context: ${allPropertyNames.join(", ") || "none"}.
${propertyOptions && propertyOptions.length > 0 ? `Available options: ${propertyOptions.map(o => o.name).join(", ")}.` : ""}

User instruction: "${instruction}"

Important: ${typeInstruction} Return ONLY the value, nothing else.`;

    // Filter rows based on skipExisting
    const rowsToProcess = skipExisting
        ? rows.filter(row => !row.properties[propertyName] || row.properties[propertyName] === "" || row.properties[propertyName] === null)
        : rows;

    const results: AutoFillColumnResult[] = [];

    // Process rows in batches to avoid rate limits
    for (let i = 0; i < rowsToProcess.length; i += batchSize) {
        const batch = rowsToProcess.slice(i, i + batchSize);

        const batchPromises = batch.map(async (row) => {
            try {
                // Build row-specific context
                const rowContext = {
                    title: row.title,
                    otherValues: Object.fromEntries(
                        Object.entries(row.properties).filter(([key]) => key !== propertyName)
                    )
                };

                let contextMsg = `Row title: "${rowContext.title}". `;
                if (Object.keys(rowContext.otherValues).length > 0) {
                    contextMsg += `Other column values: ${JSON.stringify(rowContext.otherValues)}. `;
                }

                const systemPrompt = contextInfo;
                const userPrompt = `${contextMsg}\n\nBased on this row data, ${instruction}`;

                const result = await generateWithAI(systemPrompt, userPrompt, 200);
                let cleaned = result.trim();

                // Post-process based on type
                let finalValue: any = cleaned;

                if (propertyType === "number") {
                    const num = parseFloat(cleaned.replace(/[^0-9.-]/g, ""));
                    finalValue = isNaN(num) ? null : num;
                }
                else if (propertyType === "checkbox") {
                    finalValue = cleaned.toLowerCase().includes("true") || cleaned.toLowerCase() === "yes";
                }
                else if (propertyType === "date") {
                    // Validate date format
                    const dateMatch = cleaned.match(/\d{4}-\d{2}-\d{2}/);
                    finalValue = dateMatch ? dateMatch[0] : null;
                }
                else if (propertyType === "multiSelect") {
                    // Split comma-separated values
                    finalValue = cleaned.split(",").map(v => v.trim()).filter(Boolean);
                }

                return {
                    rowId: row.rowId,
                    value: finalValue,
                };
            } catch (error: any) {
                console.error(`Error generating value for row ${row.rowId}:`, error);
                return {
                    rowId: row.rowId,
                    value: null,
                    error: error.message || "Generation failed"
                };
            }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < rowsToProcess.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
}

// ============================================================================
// NEW AI ENHANCEMENTS
// ============================================================================

/**
 * #8: Smart Property Inference
 * Analyzes sample data and suggests appropriate property types
 */
export interface PropertySuggestion {
    name: string;
    type: string;
    confidence: number;
    options?: { id: string; name: string; color: string }[];
    reasoning?: string;
}

export async function inferPropertyTypes(
    columnName: string,
    sampleValues: (string | number | boolean | null)[]
): Promise<PropertySuggestion> {
    const validSamples = sampleValues.filter(v => v !== null && v !== "").slice(0, 10);

    if (validSamples.length === 0) {
        return {
            name: columnName,
            type: "text",
            confidence: 0.5,
            reasoning: "No sample data available"
        };
    }

    const systemPrompt = `You are a database schema expert. Analyze the column name and sample values to suggest the best property type.

Available types: title, text, number, select, multiSelect, date, checkbox, url, email, phone, status

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "type": "suggested_type",
  "confidence": 0.0-1.0,
  "options": [{"id": "1", "name": "option1", "color": "#hex"}],
  "reasoning": "brief explanation"
}

For select/multiSelect/status types, extract unique options from samples.
Use these colors: #ef4444 (red), #f59e0b (orange), #10b981 (green), #3b82f6 (blue), #8b5cf6 (purple), #ec4899 (pink), #6b7280 (gray)`;

    const userPrompt = `Column name: "${columnName}"
Sample values: ${JSON.stringify(validSamples)}

Suggest the best property type.`;

    try {
        const result = await generateWithAI(systemPrompt, userPrompt, 500);
        const parsed = extractJSON(result);

        return {
            name: columnName,
            type: parsed.type || "text",
            confidence: parsed.confidence || 0.7,
            options: parsed.options,
            reasoning: parsed.reasoning
        };
    } catch (error) {
        console.error("Property inference failed:", error);
        return {
            name: columnName,
            type: "text",
            confidence: 0.5,
            reasoning: "Inference failed, defaulting to text"
        };
    }
}

/**
 * #3: Smart Suggestions
 * Generates smart suggestions for titles, tags, or next actions based on content
 */
export interface SmartSuggestion {
    type: "title" | "tag" | "action" | "property";
    value: string;
    confidence: number;
}

export async function generateSmartSuggestions(
    context: {
        currentTitle?: string;
        content?: string;
        existingTags?: string[];
        propertyValues?: Record<string, any>;
        pageType?: "page" | "database";
    }
): Promise<SmartSuggestion[]> {
    const systemPrompt = `You are an AI assistant that generates smart suggestions for a Notion-like workspace.

Based on the context, suggest:
1. Better title (if current title is generic like "Untitled")
2. Relevant tags (3-5 tags)
3. Next actions (2-3 actionable items)

Return ONLY a JSON array with this structure (no markdown):
[
  {"type": "title", "value": "suggested title", "confidence": 0.0-1.0},
  {"type": "tag", "value": "tag1", "confidence": 0.0-1.0},
  {"type": "action", "value": "action description", "confidence": 0.0-1.0}
]`;

    const userPrompt = `Context:
${context.currentTitle ? `Current title: "${context.currentTitle}"` : ""}
${context.content ? `Content preview: "${context.content.slice(0, 500)}"` : ""}
${context.existingTags ? `Existing tags: ${context.existingTags.join(", ")}` : ""}
${context.propertyValues ? `Properties: ${JSON.stringify(context.propertyValues)}` : ""}

Generate suggestions.`;

    try {
        const result = await generateWithAI(systemPrompt, userPrompt, 800);
        const parsed = extractJSON(result);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Smart suggestions failed:", error);
        return [];
    }
}

/**
 * #6: AI Writing Assistant
 * Provides inline text manipulation (rewrite, expand, shorten, change tone)
 */
export type WritingAction = "rewrite" | "expand" | "shorten" | "professional" | "casual" | "fix_grammar";

export async function transformText(
    text: string,
    action: WritingAction,
    customInstruction?: string
): Promise<string> {
    const actionPrompts: Record<WritingAction, string> = {
        rewrite: "Rewrite this text to be clearer and more engaging, maintaining the same meaning.",
        expand: "Expand this text with more details, examples, and context. Make it 2-3x longer.",
        shorten: "Condense this text to be more concise while keeping the key points. Make it 50% shorter.",
        professional: "Rewrite this text in a professional, formal tone suitable for business communication.",
        casual: "Rewrite this text in a casual, friendly tone as if talking to a friend.",
        fix_grammar: "Fix any grammar, spelling, or punctuation errors. Keep the same tone and style."
    };

    const systemPrompt = `You are a writing assistant. ${actionPrompts[action]} ${customInstruction || ""}

Return ONLY the transformed text, no explanations, no markdown formatting.`;

    const userPrompt = text;

    try {
        const result = await generateWithAI(systemPrompt, userPrompt, 1500);
        return result.trim();
    } catch (error) {
        console.error("Text transformation failed:", error);
        throw new Error("Failed to transform text");
    }
}

/**
 * #7: Bulk Table Generation
 * Generates entire database tables from a description or CSV-like prompt
 */
export interface GeneratedTable {
    title: string;
    properties: Array<{
        name: string;
        type: string;
        options?: { id: string; name: string; color: string }[];
    }>;
    rows: Array<{
        title: string;
        properties: Record<string, any>;
    }>;
}

export async function generateBulkTable(
    description: string,
    rowCount: number = 10
): Promise<GeneratedTable> {
    const systemPrompt = `You are a database generator. Create a complete database table based on the user's description.

Return ONLY a JSON object with this structure (no markdown, no explanation):
{
  "title": "Table Name",
  "properties": [
    {"name": "Status", "type": "select", "options": [{"id": "1", "name": "Active", "color": "#10b981"}]},
    {"name": "Priority", "type": "number"},
    {"name": "Due Date", "type": "date"}
  ],
  "rows": [
    {"title": "Row 1 Title", "properties": {"Status": "Active", "Priority": 5, "Due Date": "2026-01-15"}},
    {"title": "Row 2 Title", "properties": {"Status": "Pending", "Priority": 3, "Due Date": "2026-01-20"}}
  ]
}

Available types: text, number, select, multiSelect, date, checkbox, url, email, phone, status
Use realistic, diverse sample data. For select types, use colors: #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #6b7280`;

    const userPrompt = `Create a database table for: ${description}

Generate ${rowCount} sample rows with realistic data.`;

    try {
        const result = await generateWithAI(systemPrompt, userPrompt, 3000);
        const parsed = extractJSON(result);
        return parsed;
    } catch (error) {
        console.error("Bulk table generation failed:", error);
        throw new Error("Failed to generate table");
    }
}

/**
 * #4: Auto-generate Page from Topic
 * Scaffolds a complete page with sections and content from a topic
 */
export interface GeneratedPage {
    title: string;
    icon?: string;
    sections: Array<{
        type: "heading1" | "heading2" | "heading3" | "text" | "bulletList" | "numberedList" | "quote" | "callout";
        content: string;
        children?: Array<{ type: string; content: string }>;
    }>;
}

export async function generatePageFromTopic(
    topic: string,
    pageType?: "guide" | "documentation" | "notes" | "project" | "general"
): Promise<GeneratedPage> {
    const typePrompts: Record<string, string> = {
        guide: "Create a comprehensive step-by-step guide with clear sections, instructions, and tips.",
        documentation: "Create technical documentation with overview, features, usage, and examples.",
        notes: "Create organized notes with key points, summaries, and actionable items.",
        project: "Create a project page with objectives, timeline, tasks, and resources.",
        general: "Create a well-structured page with relevant sections and detailed content."
    };

    const systemPrompt = `You are a content generator for a Notion-like workspace. ${typePrompts[pageType || "general"]}

Return ONLY a JSON object with this structure (no markdown wrapper):
{
  "title": "Page Title",
  "icon": "📄",
  "sections": [
    {
      "type": "heading1",
      "content": "Section Title",
      "children": [
        {"type": "text", "content": "Paragraph content here..."},
        {"type": "bulletList", "content": "• Bullet point 1\\n• Bullet point 2"}
      ]
    }
  ]
}

Available types: heading1, heading2, heading3, text, bulletList, numberedList, quote, callout
Use emojis for icons. Create 4-6 main sections with rich, detailed content.`;

    const userPrompt = `Topic: ${topic}
Type: ${pageType || "general"}

Generate a complete page structure with content.`;

    try {
        const result = await generateWithAI(systemPrompt, userPrompt, 4000);
        console.log("AI Response for page generation:", result.substring(0, 200) + "...");
        const parsed = extractJSON(result);

        // Validate the response structure
        if (!parsed.title || !parsed.sections || !Array.isArray(parsed.sections)) {
            console.error("Invalid page structure:", parsed);
            throw new Error("AI returned invalid page structure");
        }

        return parsed;
    } catch (error) {
        console.error("Page generation failed:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate page: ${error.message}`);
        }
        throw new Error("Failed to generate page");
    }
}
