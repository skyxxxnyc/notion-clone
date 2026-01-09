"use server";

export async function generateContent(prompt: string) {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
        throw new Error("Perplexity API key is not configured");
    }

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
                    {
                        role: "system",
                        content: "You are a helpful AI writing assistant embedded in a Notion-like editor. Generate clear, concise, and well-formatted HTML content (e.g. using <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>) based on the user's prompt. Do not include markdown code blocks or conversational filler. Return only the inner body HTML.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.2,
                max_tokens: 1000, // Adjust as needed
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Perplexity API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("AI Generation failed:", error);
        throw error;
    }
}
