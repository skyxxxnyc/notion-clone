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
                model: "llama-3.1-sonar-small-128k-online",
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
