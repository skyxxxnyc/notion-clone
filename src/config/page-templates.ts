// Page Templates Configuration

export const PAGE_TEMPLATES = [
    {
        id: "blank",
        name: "Blank Page",
        description: "Start with an empty page",
        icon: "📄",
        layout: "default",
    },
    {
        id: "document",
        name: "Document with Properties",
        description: "Minimalist document workspace with properties sidebar",
        icon: "📋",
        layout: "premium",
        defaultProperties: {
            platform: "",
            objective: "",
            category: "",
            tags: [],
            type: "Detailed Prompt",
        },
    },
    {
        id: "meeting-notes",
        name: "Meeting Notes",
        description: "Template for meeting notes with attendees and action items",
        icon: "📝",
        layout: "default",
        defaultContent: `<h2>Meeting Details</h2>
<p><strong>Date:</strong> </p>
<p><strong>Attendees:</strong> </p>

<h2>Agenda</h2>
<ul>
  <li></li>
</ul>

<h2>Discussion</h2>
<p></p>

<h2>Action Items</h2>
<ul>
  <li></li>
</ul>`,
    },
    {
        id: "project-brief",
        name: "Project Brief",
        description: "Template for project planning and documentation",
        icon: "🎯",
        layout: "default",
        defaultContent: `<h2>Project Overview</h2>
<p></p>

<h2>Objectives</h2>
<ul>
  <li></li>
</ul>

<h2>Timeline</h2>
<p></p>

<h2>Resources</h2>
<ul>
  <li></li>
</ul>

<h2>Success Metrics</h2>
<p></p>`,
    },
    {
        id: "prompt-library",
        name: "AI Prompt Template",
        description: "Template for organizing AI prompts with properties",
        icon: "✨",
        layout: "premium",
        defaultProperties: {
            platform: "Perplexity",
            objective: "",
            category: "AI Prompts",
            tags: ["prompt", "ai"],
            type: "Detailed Prompt",
        },
        defaultContent: `<h2>Enhanced Prompt</h2>
<p>Enter your detailed prompt here...</p>

<h2>Expected Output</h2>
<p>Describe what you expect from this prompt...</p>

<h2>Use Cases</h2>
<ul>
  <li></li>
</ul>`,
    },
];

export type PageTemplate = typeof PAGE_TEMPLATES[number];
