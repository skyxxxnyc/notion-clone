'use server'

/**
 * Pica OS Edge Function Integrations
 * 
 * required environment variables:
 * - PICA_SECRET_KEY
 * - PICA_GMAIL_CONNECTION_KEY
 * - PICA_GOOGLE_CALENDAR_CONNECTION_KEY
 * - PICA_ANTHROPIC_CONNECTION_KEY
 * - PICA_PERPLEXITY_CONNECTION_KEY
 * - PICA_NOTION_CONNECTION_KEY
 */

/**
 * 1. Send an Email via Gmail
 */
export async function sendMail(encodedRaw: string) {
    if (!process.env.PICA_SECRET_KEY || !process.env.PICA_GMAIL_CONNECTION_KEY) {
        throw new Error('Missing Pica Gmail environment variables');
    }

    const res = await fetch('https://api.picaos.com/v1/passthrough/users/me/messages/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-pica-secret': process.env.PICA_SECRET_KEY,
            'x-pica-connection-key': process.env.PICA_GMAIL_CONNECTION_KEY,
            'x-pica-action-id': 'conn_mod_def::F_JeJ_A_TKg::cc2kvVQQTiiIiLEDauy6zQ'
        },
        body: JSON.stringify({ raw: encodedRaw })
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to send email: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return res.json();
}

/**
 * 2. Fetch Google Calendar Info
 */
export async function getCalendar(calendarId = 'primary') {
    if (!process.env.PICA_SECRET_KEY || !process.env.PICA_GOOGLE_CALENDAR_CONNECTION_KEY) {
        throw new Error('Missing Pica Google Calendar environment variables');
    }

    const res = await fetch(`https://api.picaos.com/v1/passthrough/calendars/${calendarId}`, {
        method: 'GET',
        headers: {
            'x-pica-secret': process.env.PICA_SECRET_KEY,
            'x-pica-connection-key': process.env.PICA_GOOGLE_CALENDAR_CONNECTION_KEY,
            'x-pica-action-id': 'conn_mod_def::F_Jdkx-0DP4::BU2Mi_ipR3KoadE9DDdj9g'
        }
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to get calendar: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return res.json();
}

/**
 * 3. Claude Prompt Generation (Anthropic)
 */
interface GeneratePromptBody {
    task: string;
    target_model?: string;
    [key: string]: unknown;
}

export async function generatePrompt(task: string, target_model?: string) {
    if (!process.env.PICA_SECRET_KEY || !process.env.PICA_ANTHROPIC_CONNECTION_KEY) {
        throw new Error('Missing Pica Anthropic environment variables');
    }

    const body: GeneratePromptBody = { task };
    if (target_model) body.target_model = target_model;

    const res = await fetch('https://api.picaos.com/v1/passthrough/v1/experimental/generate_prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-pica-secret': process.env.PICA_SECRET_KEY,
            'x-pica-connection-key': process.env.PICA_ANTHROPIC_CONNECTION_KEY,
            'x-pica-action-id': 'conn_mod_def::GDyeKK4nNxU::L9F2BBkfQpiycLUebBniJA'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to generate prompt: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return res.json();
}

/**
 * 4. Perplexity: Deep Research and Reasoning (Chat Completions)
 */
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function perplexityDeepReasoning(model: string, messages: ChatMessage[], opts: Record<string, unknown> = {}) {
    if (!process.env.PICA_SECRET_KEY || !process.env.PICA_PERPLEXITY_CONNECTION_KEY) {
        throw new Error('Missing Pica Perplexity environment variables');
    }

    const body = { model, messages, ...opts };

    const res = await fetch('https://api.picaos.com/v1/passthrough/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-pica-secret': process.env.PICA_SECRET_KEY,
            'x-pica-connection-key': process.env.PICA_PERPLEXITY_CONNECTION_KEY,
            'x-pica-action-id': 'conn_mod_def::GCY0iK-iGks::TKAh9sv2Ts2HJdLJc5a60A'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to perform deep reasoning: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return res.json();
}

/**
 * 5. Create a Page in Notion Clone (Pica internal probably, or external Notion)
 */
type NotionParent =
    | { workspace: true }
    | { page_id: string }
    | { data_source_id: string };

export async function createNotionPage(contentTitle: string, parent: NotionParent = { workspace: true }) {
    if (!process.env.PICA_SECRET_KEY || !process.env.PICA_NOTION_CONNECTION_KEY) {
        throw new Error('Missing Pica Notion environment variables');
    }

    const body = {
        parent,
        properties: { title: [{ text: { content: contentTitle } }] }
    };

    const res = await fetch('https://api.picaos.com/v1/passthrough/pages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-pica-secret': process.env.PICA_SECRET_KEY,
            'x-pica-connection-key': process.env.PICA_NOTION_CONNECTION_KEY,
            'x-pica-action-id': 'conn_mod_def::GHfWaZEpgwM::MD-EsgOiTrqaPIyodz5ZVg'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create notion page: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return res.json();
}
