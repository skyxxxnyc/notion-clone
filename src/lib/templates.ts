import { DatabaseConfig, Block } from "@/types";
import { DatabaseLayout, DEFAULT_DATABASE_LAYOUT, TABBED_PROJECT_LAYOUT, CRM_CONTACT_LAYOUT } from "@/types/layout";

export interface Template {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    icon: string;
    color: string;
    databaseConfig?: DatabaseConfig;
    layout?: DatabaseLayout;
    type?: "database" | "page";
    initialBlocks?: Partial<Block>[];
}

export type TemplateCategory =
    | "productivity"
    | "project_management"
    | "crm"
    | "content"
    | "personal"
    | "team";

export const TEMPLATE_LIBRARY: Template[] = [
    // New System Templates
    {
        id: "system-blueprint",
        name: "System Blueprint",
        description: "Dark Neo-Brutalist system definition with prompt engineering layout",
        category: "project_management",
        icon: "🚀",
        color: "#ccff00",
        type: "page",
        initialBlocks: [
            {
                type: "heading1",
                content: "SOLO CLIENT ACQUISITION SYSTEM",
                properties: {}
            },
            {
                type: "heading2",
                content: "Enhanced Prompt",
                properties: {}
            },
            {
                type: "quote",
                content: "Leverage Perplexity's advanced real-time search capabilities to develop a robust client acquisition strategy tailored for SOLOPRENEUR BUSINESS TYPE. This strategy should focus on generating a steady stream of leads efficiently.",
                properties: {}
            },
            {
                type: "heading2",
                content: "Properties",
                properties: {}
            },
            {
                type: "bulletList",
                content: "Platform: Perplexity",
                properties: {}
            },
            {
                type: "bulletList",
                content: "Category: Client & Sales Content",
                properties: {}
            },
            {
                type: "bulletList",
                content: "Status: Operational",
                properties: {}
            }
        ]
    },
    {
        id: "operations-dashboard",
        name: "Operations Dashboard",
        description: "High-level overview with metrics and status cards",
        category: "productivity",
        icon: "📊",
        color: "#3b82f6",
        type: "page",
        initialBlocks: [
            {
                type: "heading1",
                content: "Client Acquisition System Overview",
                properties: {}
            },
            {
                type: "heading2",
                content: "Key Metrics",
                properties: {}
            },
            {
                type: "quote",
                content: "Leads Generated: 1,245 (+12% from last month)",
                properties: {}
            },
            {
                type: "quote",
                content: "Conversion Rate: 4.8% (Target: 5.0%)",
                properties: {}
            },
            {
                type: "quote",
                content: "Avg. Cost Per Lead: $2.15",
                properties: {}
            },
            {
                type: "heading2",
                content: "System Status",
                properties: {}
            },
            {
                type: "bulletList",
                content: "Platform: Perplexity (Active)",
                properties: {}
            },
            {
                type: "bulletList",
                content: "Property Group: Default",
                properties: {}
            }
        ]
    },

    // --- STRATEGY & PLANNING ---
    {
        id: "lean-canvas",
        name: "Lean Canvas",
        description: "One-page business plan adaptation for fast modeling",
        category: "project_management",
        icon: "💡",
        color: "#f59e0b",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Lean Canvas Model", properties: {} },
            { type: "divider", content: "", properties: {} },
            { type: "heading2", content: "Problem", properties: {} },
            { type: "bulletList", content: "Top 3 problems customers face", properties: {} },
            { type: "heading2", content: "Solution", properties: {} },
            { type: "bulletList", content: "Top 3 features", properties: {} },
            { type: "heading2", content: "Unique Value Prop", properties: {} },
            { type: "quote", content: "Single, clear, compelling message that turns an unaware visitor into an interested prospect.", properties: {} },
            { type: "heading2", content: "Unfair Advantage", properties: {} },
            { type: "bulletList", content: "Can't be easily copied or bought", properties: {} }
        ]
    },
    {
        id: "okr-dashboard",
        name: "OKR Dashboard",
        description: "Objectives and Key Results tracking framework",
        category: "team",
        icon: "🎯",
        color: "#ef4444",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Q1 Objectives & Key Results", properties: {} },
            { type: "quote", content: "Focus: Scale User Acquisition", properties: {} },
            { type: "heading2", content: "Objective 1: Increase ARR by 20%", properties: {} },
            { type: "todoList", content: "Launch Enterprise Plan", properties: {} },
            { type: "todoList", content: "Hire 2 Sales Reps", properties: {} },
            { type: "todoList", content: "Optimize Funnel (+5% conversion)", properties: {} },
            { type: "heading2", content: "Objective 2: Improve System Reliability", properties: {} },
            { type: "todoList", content: "Achieve 99.9% Uptime", properties: {} }
        ]
    },
    {
        id: "swot-analysis",
        name: "SWOT Analysis",
        description: "Strategic planning method (Strengths, Weaknesses, Opportunities, Threats)",
        category: "project_management",
        icon: "🛡️",
        color: "#6366f1",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "SWOT Analysis: [Project Name]", properties: {} },
            { type: "heading2", content: "Strengths (Internal)", properties: {} },
            { type: "bulletList", content: "Strong brand recognition", properties: {} },
            { type: "heading2", content: "Weaknesses (Internal)", properties: {} },
            { type: "bulletList", content: "Limited budget", properties: {} },
            { type: "heading2", content: "Opportunities (External)", properties: {} },
            { type: "bulletList", content: "Emerging market trend", properties: {} },
            { type: "heading2", content: "Threats (External)", properties: {} },
            { type: "bulletList", content: "New competitor entry", properties: {} }
        ]
    },
    {
        id: "project-spec",
        name: "Product Spec",
        description: "Detailed specification for new features",
        category: "project_management",
        icon: "📝",
        color: "#3b82f6",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Feature Specification", properties: {} },
            { type: "quote", content: "Status: DRAFT | Owner: @User", properties: {} },
            { type: "heading2", content: "Problem Statement", properties: {} },
            { type: "text", content: "Users currently struggle to...", properties: {} },
            { type: "heading2", content: "Proposed Solution", properties: {} },
            { type: "text", content: "We will build a...", properties: {} },
            { type: "heading2", content: "User Stories", properties: {} },
            { type: "todoList", content: "As a user, I can...", properties: {} },
            { type: "heading2", content: "Success Metrics", properties: {} },
            { type: "bulletList", content: "Adoption rate > 10%", properties: {} }
        ]
    },
    {
        id: "brand-guidelines",
        name: "Brand Guidelines",
        description: "Core brand identity documentation",
        category: "content",
        icon: "🎨",
        color: "#ec4899",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Brand Identity", properties: {} },
            { type: "divider", content: "", properties: {} },
            { type: "heading2", content: "Mission Statement", properties: {} },
            { type: "quote", content: "To empower creators to build...", properties: {} },
            { type: "heading2", content: "Brand Voice", properties: {} },
            { type: "bulletList", content: "Confident but humble", properties: {} },
            { type: "bulletList", content: "Professional yet approachable", properties: {} },
            { type: "heading2", content: "Primary Colors", properties: {} },
            { type: "bulletList", content: "Neo-Black (#0a0a0a)", properties: {} },
            { type: "bulletList", content: "Acid Green (#ccff00)", properties: {} }
        ]
    },

    // --- CONTENT & MEDIA ---
    {
        id: "video-script",
        name: "Video Script",
        description: "Structure for YouTube or long-form video",
        category: "content",
        icon: "🎬",
        color: "#ef4444",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Video Title: [Insert Title]", properties: {} },
            { type: "quote", content: "Goal: Drive signups to newsletter", properties: {} },
            { type: "heading2", content: "The Hook (0:00 - 0:45)", properties: {} },
            { type: "text", content: "[Visual: Face to camera] Did you know that...", properties: {} },
            { type: "heading2", content: "The Setup", properties: {} },
            { type: "text", content: "In this video, we're going to cover...", properties: {} },
            { type: "heading2", content: "Core Content", properties: {} },
            { type: "bulletList", content: "Point 1", properties: {} },
            { type: "heading2", content: "Call to Action", properties: {} },
            { type: "text", content: "Don't forget to subscribe...", properties: {} }
        ]
    },
    {
        id: "blog-outline",
        name: "Blog Post Outline",
        description: "SEO-optimized article structure",
        category: "content",
        icon: "✍️",
        color: "#f59e0b",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Article Title", properties: {} },
            { type: "quote", content: "Keywords: [Keyword 1], [Keyword 2]", properties: {} },
            { type: "heading2", content: "Introduction", properties: {} },
            { type: "bulletList", content: "Hook", properties: {} },
            { type: "bulletList", content: "Thesis statement", properties: {} },
            { type: "heading2", content: "H2: Main Point 1", properties: {} },
            { type: "text", content: "Details...", properties: {} },
            { type: "heading2", content: "H2: Main Point 2", properties: {} },
            { type: "heading2", content: "Conclusion", properties: {} },
            { type: "heading2", content: "FAQ Schema", properties: {} }
        ]
    },
    {
        id: "newsletter-builder",
        name: "Newsletter Builder",
        description: "Template for weekly email blasts",
        category: "content",
        icon: "📧",
        color: "#3b82f6",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Newsletter Issue #", properties: {} },
            { type: "heading2", content: "Subject Line Ideas", properties: {} },
            { type: "todoList", content: "Idea A: ...", properties: {} },
            { type: "heading2", content: "Intro / Personal Note", properties: {} },
            { type: "text", content: "Hey standard...", properties: {} },
            { type: "heading2", content: "Main Story", properties: {} },
            { type: "heading2", content: "Curated Links", properties: {} },
            { type: "bulletList", content: "Link 1", properties: {} },
            { type: "heading2", content: "Sponsor / Ad", properties: {} }
        ]
    },
    {
        id: "pod-show-notes",
        name: "Podcast Show Notes",
        description: " Episode planning and show notes",
        category: "content",
        icon: "🎙️",
        color: "#8b5cf6",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Ep ##: Guest Name", properties: {} },
            { type: "heading2", content: "Guest Bio", properties: {} },
            { type: "text", content: "Short bio...", properties: {} },
            { type: "heading2", content: "Discussion Topics", properties: {} },
            { type: "bulletList", content: "Topic 1", properties: {} },
            { type: "heading2", content: "Links & Resources", properties: {} },
            { type: "bulletList", content: "Book mentioned", properties: {} }
        ]
    },

    // --- PERSONAL & PRODUCTIVITY ---
    {
        id: "daily-monk-mode",
        name: "Daily Monk Mode",
        description: "Distraction-free daily planner",
        category: "personal",
        icon: "🧘",
        color: "#10b981",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Daily Focus", properties: {} },
            { type: "quote", content: "The One Thing I Must Do Today:", properties: {} },
            { type: "heading2", content: "Time Blocks", properties: {} },
            { type: "todoList", content: "08:00 - 10:00: Deep Work", properties: {} },
            { type: "todoList", content: "10:00 - 12:00: Creative", properties: {} },
            { type: "heading2", content: "Mindset", properties: {} },
            { type: "text", content: "I am grateful for...", properties: {} }
        ]
    },
    {
        id: "weekly-review",
        name: "Weekly Review",
        description: "Friday retrospective and planning",
        category: "personal",
        icon: "📅",
        color: "#f59e0b",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Weekly Review", properties: {} },
            { type: "heading2", content: "Reflections", properties: {} },
            { type: "bulletList", content: "What went well?", properties: {} },
            { type: "bulletList", content: "What didn't go well?", properties: {} },
            { type: "heading2", content: "Key Metrics", properties: {} },
            { type: "text", content: "Habits completed: X/7", properties: {} },
            { type: "heading2", content: "Next Week's Focus", properties: {} },
            { type: "todoList", content: "Top Goal 1", properties: {} }
        ]
    },
    {
        id: "habit-stack",
        name: "Habit Stack",
        description: "Atomic Habits implementation guide",
        category: "personal",
        icon: "🔁",
        color: "#ec4899",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "My Habit Stacks", properties: {} },
            { type: "quote", content: "After I [CURRENT HABIT], I will [NEW HABIT].", properties: {} },
            { type: "heading2", content: "Morning", properties: {} },
            { type: "bulletList", content: "After I pour coffee, I will meditate for 1 min.", properties: {} },
            { type: "heading2", content: "Work Start", properties: {} },
            { type: "bulletList", content: "After I sit down, I will write my top 3 tasks.", properties: {} },
            { type: "heading2", content: "Evening", properties: {} },
            { type: "bulletList", content: "After I brush teeth, I will read 1 page.", properties: {} }
        ]
    },
    {
        id: "reading-notes",
        name: "Reading Notes",
        description: "Book summary and insight collection",
        category: "personal",
        icon: "📚",
        color: "#3b82f6",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Book Title", properties: {} },
            { type: "text", content: "Author: Name | Date: YYYY", properties: {} },
            { type: "heading2", content: "One-Sentence Summary", properties: {} },
            { type: "quote", content: "Insert summary here.", properties: {} },
            { type: "heading2", content: "Key Insights", properties: {} },
            { type: "bulletList", content: "Insight 1", properties: {} },
            { type: "bulletList", content: "Insight 2", properties: {} },
            { type: "heading2", content: "Quotes", properties: {} },
            { type: "quote", content: "Memorable quote...", properties: {} }
        ]
    },
    {
        id: "decision-journal",
        name: "Decision Journal",
        description: "Framework for making big decisions",
        category: "personal",
        icon: "⚖️",
        color: "#6366f1",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Decision: [Decision Name]", properties: {} },
            { type: "text", content: "Date: YYYY-MM-DD", properties: {} },
            { type: "heading2", content: "The Context", properties: {} },
            { type: "text", content: "What is the situation?", properties: {} },
            { type: "heading2", content: "The Options", properties: {} },
            { type: "bulletList", content: "Option A", properties: {} },
            { type: "bulletList", content: "Option B", properties: {} },
            { type: "heading2", content: "The Choice", properties: {} },
            { type: "text", content: "I chose X because...", properties: {} },
            { type: "heading2", content: "Expected Outcome (Prediction)", properties: {} },
            { type: "text", content: "I expect that within 6 months...", properties: {} }
        ]
    },

    // --- TEAM & HR ---
    {
        id: "new-hire-onboarding",
        name: "New Hire Onboarding",
        description: "First week guide for new employees",
        category: "team",
        icon: "👋",
        color: "#10b981",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Welcome to the Team, [Name]!", properties: {} },
            { type: "heading2", content: "Your First Week", properties: {} },
            { type: "heading3", content: "Day 1: Setup", properties: {} },
            { type: "todoList", content: "Set up email", properties: {} },
            { type: "todoList", content: "Join Slack", properties: {} },
            { type: "heading3", content: "Day 2: Meet the Team", properties: {} },
            { type: "heading2", content: "Key Resources", properties: {} },
            { type: "bulletList", content: "Employee Handbook link", properties: {} },
            { type: "heading2", content: "Important Contacts", properties: {} }
        ]
    },
    {
        id: "meeting-notes-adv",
        name: "Advanced Meeting Notes",
        description: "Structured agenda, notes, and actions",
        category: "team",
        icon: "📝",
        color: "#f59e0b",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Meeting: [Topic]", properties: {} },
            { type: "text", content: "Date: Today | Attendees: All", properties: {} },
            { type: "heading2", content: "Agenda", properties: {} },
            { type: "todoList", content: "Item 1", properties: {} },
            { type: "heading2", content: "Discussion Notes", properties: {} },
            { type: "bulletList", content: "Point A", properties: {} },
            { type: "heading2", content: "Action Items", properties: {} },
            { type: "todoList", content: "@Person to do X by [Date]", properties: {} }
        ]
    },
    {
        id: "incident-report",
        name: "Incident Post-Mortem",
        description: "SRE style incident review",
        category: "team",
        icon: "🚨",
        color: "#ef4444",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Incident #123 Post-Mortem", properties: {} },
            { type: "quote", content: "Severity: High | Duration: 2h", properties: {} },
            { type: "heading2", content: "Summary", properties: {} },
            { type: "text", content: "What happened...", properties: {} },
            { type: "heading2", content: "Timeline", properties: {} },
            { type: "bulletList", content: "10:00 UTC - Alert fired", properties: {} },
            { type: "heading2", content: "Root Cause", properties: {} },
            { type: "heading2", content: "Corrective Actions", properties: {} },
            { type: "todoList", content: "Fix bug", properties: {} }
        ]
    },

    // --- CRM & CLIENTS ---
    {
        id: "client-portal",
        name: "Client Portal Hub",
        description: "Shared home page for clients",
        category: "crm",
        icon: "🏠",
        color: "#3b82f6",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Welcome, [Client Name]", properties: {} },
            { type: "quote", content: "Project Status: ON TRACK", properties: {} },
            { type: "heading2", content: "Quick Links", properties: {} },
            { type: "bulletList", content: "Project Roadmap", properties: {} },
            { type: "bulletList", content: "Design Assets", properties: {} },
            { type: "heading2", content: "Recent Updates", properties: {} },
            { type: "bulletList", content: "Weekly Report uploaded", properties: {} },
            { type: "heading2", content: "Next Meeting", properties: {} }
        ]
    },
    {
        id: "sales-script",
        name: "Sales Call Script",
        description: "Qualification framework for sales calls",
        category: "crm",
        icon: "📞",
        color: "#10b981",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Discovery Call Script", properties: {} },
            { type: "heading2", content: "Rapport Building", properties: {} },
            { type: "text", content: "Ask about...", properties: {} },
            { type: "heading2", content: "Problem Discovery (Pain)", properties: {} },
            { type: "bulletList", content: "What is your biggest challenge with X?", properties: {} },
            { type: "heading2", content: "Solution Mapping", properties: {} },
            { type: "heading2", content: "Objection Handling", properties: {} },
            { type: "heading2", content: "Next Steps / Close", properties: {} }
        ]
    },
    {
        id: "proposal-doc",
        name: "Service Proposal",
        description: "Professional services proposal format",
        category: "crm",
        icon: "💼",
        color: "#06b6d4",
        type: "page",
        initialBlocks: [
            { type: "heading1", content: "Proposal for [Client]", properties: {} },
            { type: "heading2", content: "Executive Summary", properties: {} },
            { type: "text", content: "We propose to...", properties: {} },
            { type: "heading2", content: "Scope of Work", properties: {} },
            { type: "bulletList", content: "Phase 1: Discovery", properties: {} },
            { type: "bulletList", content: "Phase 2: Execution", properties: {} },
            { type: "heading2", content: "Timeline & Investment", properties: {} },
            { type: "text", content: "Total Budget: $X", properties: {} },
            { type: "heading2", content: "Next Steps", properties: {} }
        ]
    },
    // Productivity Templates
    {
        id: "task-list",
        name: "Task List",
        description: "Simple task tracker with status and priority",
        category: "productivity",
        icon: "✓",
        color: "#3b82f6",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Task", type: "title", isVisible: true, width: 300 },
                {
                    id: "status",
                    name: "Status",
                    type: "select",
                    isVisible: true,
                    width: 120,
                    options: [
                        { id: "todo", name: "To Do", color: "#e5e5e5" },
                        { id: "in-progress", name: "In Progress", color: "#fef3c7" },
                        { id: "done", name: "Done", color: "#dcfce7" }
                    ]
                },
                {
                    id: "priority",
                    name: "Priority",
                    type: "select",
                    isVisible: true,
                    width: 100,
                    options: [
                        { id: "high", name: "High", color: "#fee2e2" },
                        { id: "medium", name: "Medium", color: "#fef3c7" },
                        { id: "low", name: "Low", color: "#dbeafe" }
                    ]
                },
                { id: "due-date", name: "Due Date", type: "date", isVisible: true, width: 120 }
            ],
            views: [{
                id: "1",
                name: "All Tasks",
                type: "table",
                filters: [],
                sorts: [],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "meeting-notes",
        name: "Meeting Notes",
        description: "Structured template for meeting documentation",
        category: "productivity",
        icon: "📝",
        color: "#8b5cf6",
        layout: {
            ...DEFAULT_DATABASE_LAYOUT,
            pinnedPropertyIds: ["date", "attendees"]
        },
        databaseConfig: {
            properties: [
                { id: "title", name: "Meeting Title", type: "title", isVisible: true, width: 300 },
                { id: "date", name: "Date", type: "date", isVisible: true, width: 120 },
                { id: "attendees", name: "Attendees", type: "text", isVisible: true, width: 200 },
                { id: "location", name: "Location", type: "text", isVisible: true, width: 150 }
            ],
            views: [{
                id: "1",
                name: "All Meetings",
                type: "table",
                filters: [],
                sorts: [{ id: "sort-1", propertyId: "date", direction: "descending" }],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "habit-tracker",
        name: "Habit Tracker",
        description: "Track daily habits and build streaks",
        category: "personal",
        icon: "🎯",
        color: "#10b981",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Habit", type: "title", isVisible: true, width: 250 },
                {
                    id: "frequency", name: "Frequency", type: "select", isVisible: true, width: 120, options: [
                        { id: "daily", name: "Daily", color: "#dbeafe" },
                        { id: "weekly", name: "Weekly", color: "#fef3c7" }
                    ]
                },
                { id: "streak", name: "Streak", type: "number", isVisible: true, width: 80 },
                { id: "last-done", name: "Last Done", type: "date", isVisible: true, width: 120 }
            ],
            views: [{
                id: "1",
                name: "Active Habits",
                type: "table",
                filters: [],
                sorts: [],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "reading-list",
        name: "Reading List",
        description: "Organize books and articles to read",
        category: "personal",
        icon: "📚",
        color: "#f59e0b",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Title", type: "title", isVisible: true, width: 300 },
                { id: "author", name: "Author", type: "text", isVisible: true, width: 150 },
                {
                    id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                        { id: "to-read", name: "To Read", color: "#e5e5e5" },
                        { id: "reading", name: "Reading", color: "#fef3c7" },
                        { id: "finished", name: "Finished", color: "#dcfce7" }
                    ]
                },
                { id: "rating", name: "Rating", type: "number", isVisible: true, width: 80 }
            ],
            views: [
                {
                    id: "1",
                    name: "All Books",
                    type: "table",
                    filters: [],
                    sorts: [],
                    visibleProperties: [],
                    config: {}
                },
                {
                    id: "2",
                    name: "Currently Reading",
                    type: "gallery",
                    filters: [{ id: "filter-1", propertyId: "status", operator: "equals", value: "reading" }],
                    sorts: [],
                    visibleProperties: [],
                    config: {}
                }
            ],
            defaultViewId: "1"
        }
    },

    // Project Management Templates
    {
        id: "project-tracker",
        name: "Project Tracker",
        description: "Comprehensive project management with tasks and milestones",
        category: "project_management",
        icon: "📊",
        color: "#3b82f6",
        layout: TABBED_PROJECT_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Project Name", type: "title", isVisible: true, width: 300 },
                {
                    id: "status", name: "Status", type: "status", isVisible: true, width: 120, options: [
                        { id: "planning", name: "Planning", color: "#e0e7ff" },
                        { id: "active", name: "Active", color: "#fef3c7" },
                        { id: "on-hold", name: "On Hold", color: "#fee2e2" },
                        { id: "completed", name: "Completed", color: "#dcfce7" }
                    ]
                },
                { id: "owner", name: "Owner", type: "text", isVisible: true, width: 150 },
                { id: "deadline", name: "Deadline", type: "date", isVisible: true, width: 120 },
                { id: "progress", name: "Progress %", type: "number", isVisible: true, width: 100 }
            ],
            views: [{
                id: "1",
                name: "Active Projects",
                type: "board",
                filters: [],
                sorts: [],
                groupBy: "status",
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "sprint-planning",
        name: "Sprint Planning",
        description: "Agile sprint board with story points",
        category: "project_management",
        icon: "⚡",
        color: "#6366f1",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Story", type: "title", isVisible: true, width: 300 },
                {
                    id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                        { id: "backlog", name: "Backlog", color: "#e5e5e5" },
                        { id: "todo", name: "To Do", color: "#dbeafe" },
                        { id: "in-progress", name: "In Progress", color: "#fef3c7" },
                        { id: "review", name: "Review", color: "#fde68a" },
                        { id: "done", name: "Done", color: "#dcfce7" }
                    ]
                },
                { id: "points", name: "Story Points", type: "number", isVisible: true, width: 80 },
                { id: "assignee", name: "Assignee", type: "text", isVisible: true, width: 150 },
                {
                    id: "sprint", name: "Sprint", type: "select", isVisible: true, width: 100, options: [
                        { id: "sprint-1", name: "Sprint 1", color: "#dbeafe" },
                        { id: "sprint-2", name: "Sprint 2", color: "#fef3c7" }
                    ]
                }
            ],
            views: [{
                id: "1",
                name: "Sprint Board",
                type: "board",
                filters: [],
                sorts: [],
                groupBy: "status",
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "roadmap",
        name: "Product Roadmap",
        description: "Timeline view for product planning",
        category: "project_management",
        icon: "🗺️",
        color: "#8b5cf6",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Feature", type: "title", isVisible: true, width: 300 },
                {
                    id: "quarter", name: "Quarter", type: "select", isVisible: true, width: 100, options: [
                        { id: "q1", name: "Q1", color: "#dbeafe" },
                        { id: "q2", name: "Q2", color: "#fef3c7" },
                        { id: "q3", name: "Q3", color: "#fde68a" },
                        { id: "q4", name: "Q4", color: "#dcfce7" }
                    ]
                },
                {
                    id: "priority", name: "Priority", type: "select", isVisible: true, width: 100, options: [
                        { id: "p0", name: "P0", color: "#fee2e2" },
                        { id: "p1", name: "P1", color: "#fef3c7" },
                        { id: "p2", name: "P2", color: "#dbeafe" }
                    ]
                },
                { id: "start", name: "Start Date", type: "date", isVisible: true, width: 120 },
                { id: "end", name: "End Date", type: "date", isVisible: true, width: 120 }
            ],
            views: [{
                id: "1",
                name: "Timeline",
                type: "timeline",
                filters: [],
                sorts: [],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },

    // CRM Templates
    {
        id: "contacts",
        name: "Contact Database",
        description: "Manage contacts and relationships",
        category: "crm",
        icon: "👥",
        color: "#ec4899",
        layout: CRM_CONTACT_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Name", type: "title", isVisible: true, width: 200 },
                { id: "email", name: "Email", type: "email", isVisible: true, width: 200 },
                { id: "phone", name: "Phone", type: "phone", isVisible: true, width: 150 },
                { id: "company", name: "Company", type: "text", isVisible: true, width: 150 },
                {
                    id: "category", name: "Category", type: "select", isVisible: true, width: 120, options: [
                        { id: "client", name: "Client", color: "#dcfce7" },
                        { id: "prospect", name: "Prospect", color: "#fef3c7" },
                        { id: "partner", name: "Partner", color: "#dbeafe" }
                    ]
                }
            ],
            views: [{
                id: "1",
                name: "All Contacts",
                type: "table",
                filters: [],
                sorts: [],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "sales-pipeline",
        name: "Sales Pipeline",
        description: "Track deals through sales stages",
        category: "crm",
        icon: "💰",
        color: "#10b981",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Deal Name", type: "title", isVisible: true, width: 250 },
                {
                    id: "stage", name: "Stage", type: "select", isVisible: true, width: 150, options: [
                        { id: "lead", name: "Lead", color: "#e5e5e5" },
                        { id: "qualified", name: "Qualified", color: "#dbeafe" },
                        { id: "proposal", name: "Proposal", color: "#fef3c7" },
                        { id: "negotiation", name: "Negotiation", color: "#fde68a" },
                        { id: "closed-won", name: "Closed Won", color: "#dcfce7" },
                        { id: "closed-lost", name: "Closed Lost", color: "#fee2e2" }
                    ]
                },
                { id: "value", name: "Deal Value", type: "number", isVisible: true, width: 120 },
                { id: "company", name: "Company", type: "text", isVisible: true, width: 150 },
                { id: "close-date", name: "Expected Close", type: "date", isVisible: true, width: 120 }
            ],
            views: [{
                id: "1",
                name: "Pipeline",
                type: "board",
                filters: [],
                sorts: [],
                groupBy: "stage",
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "job-applications",
        name: "Job Applications",
        description: "Track job search and applications",
        category: "personal",
        icon: "💼",
        color: "#3b82f6",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Company", type: "title", isVisible: true, width: 200 },
                { id: "position", name: "Position", type: "text", isVisible: true, width: 200 },
                {
                    id: "status", name: "Status", type: "select", isVisible: true, width: 150, options: [
                        { id: "wishlist", name: "Wishlist", color: "#e5e5e5" },
                        { id: "applied", name: "Applied", color: "#dbeafe" },
                        { id: "phone-screen", name: "Phone Screen", color: "#fef3c7" },
                        { id: "interview", name: "Interview", color: "#fde68a" },
                        { id: "offer", name: "Offer", color: "#dcfce7" },
                        { id: "rejected", name: "Rejected", color: "#fee2e2" }
                    ]
                },
                { id: "applied-date", name: "Applied Date", type: "date", isVisible: true, width: 120 },
                { id: "url", name: "Job URL", type: "url", isVisible: true, width: 200 }
            ],
            views: [{
                id: "1",
                name: "Application Tracker",
                type: "board",
                filters: [],
                sorts: [],
                groupBy: "status",
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },

    // Content Templates
    {
        id: "blog-posts",
        name: "Blog Posts",
        description: "Content calendar for blog management",
        category: "content",
        icon: "✍️",
        color: "#f59e0b",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Post Title", type: "title", isVisible: true, width: 300 },
                {
                    id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                        { id: "idea", name: "Idea", color: "#e5e5e5" },
                        { id: "draft", name: "Draft", color: "#fef3c7" },
                        { id: "review", name: "Review", color: "#fde68a" },
                        { id: "published", name: "Published", color: "#dcfce7" }
                    ]
                },
                { id: "author", name: "Author", type: "text", isVisible: true, width: 150 },
                { id: "publish-date", name: "Publish Date", type: "date", isVisible: true, width: 120 },
                {
                    id: "tags", name: "Tags", type: "multiSelect", isVisible: true, width: 200, options: [
                        { id: "tech", name: "Tech", color: "#dbeafe" },
                        { id: "business", name: "Business", color: "#fef3c7" },
                        { id: "tutorial", name: "Tutorial", color: "#dcfce7" }
                    ]
                }
            ],
            views: [
                {
                    id: "1",
                    name: "Calendar",
                    type: "calendar",
                    filters: [],
                    sorts: [],
                    visibleProperties: [],
                    config: {}
                },
                {
                    id: "2",
                    name: "By Status",
                    type: "board",
                    filters: [],
                    sorts: [],
                    groupBy: "status",
                    visibleProperties: [],
                    config: {}
                }
            ],
            defaultViewId: "1"
        }
    },
    {
        id: "social-media",
        name: "Social Media Calendar",
        description: "Plan and schedule social media posts",
        category: "content",
        icon: "📱",
        color: "#ec4899",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Post", type: "title", isVisible: true, width: 300 },
                {
                    id: "platform", name: "Platform", type: "multiSelect", isVisible: true, width: 150, options: [
                        { id: "twitter", name: "Twitter", color: "#dbeafe" },
                        { id: "linkedin", name: "LinkedIn", color: "#e0e7ff" },
                        { id: "instagram", name: "Instagram", color: "#fce7f3" }
                    ]
                },
                { id: "date", name: "Post Date", type: "date", isVisible: true, width: 120 },
                {
                    id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                        { id: "draft", name: "Draft", color: "#e5e5e5" },
                        { id: "scheduled", name: "Scheduled", color: "#fef3c7" },
                        { id: "posted", name: "Posted", color: "#dcfce7" }
                    ]
                }
            ],
            views: [{
                id: "1",
                name: "Calendar",
                type: "calendar",
                filters: [],
                sorts: [],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "video-production",
        name: "Video Production",
        description: "Track video content from ideation to publication",
        category: "content",
        icon: "🎥",
        color: "#ef4444",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Video Title", type: "title", isVisible: true, width: 300 },
                {
                    id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                        { id: "scripting", name: "Scripting", color: "#e5e5e5" },
                        { id: "filming", name: "Filming", color: "#fef3c7" },
                        { id: "editing", name: "Editing", color: "#fde68a" },
                        { id: "published", name: "Published", color: "#dcfce7" }
                    ]
                },
                { id: "duration", name: "Duration (min)", type: "number", isVisible: true, width: 100 },
                { id: "publish-date", name: "Publish Date", type: "date", isVisible: true, width: 120 }
            ],
            views: [{
                id: "1",
                name: "Production Pipeline",
                type: "board",
                filters: [],
                sorts: [],
                groupBy: "status",
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },

    // Team Templates
    {
        id: "team-directory",
        name: "Team Directory",
        description: "Company directory with roles and contact info",
        category: "team",
        icon: "👨‍👩‍👧‍👦",
        color: "#6366f1",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Name", type: "title", isVisible: true, width: 200 },
                { id: "role", name: "Role", type: "text", isVisible: true, width: 150 },
                {
                    id: "department", name: "Department", type: "select", isVisible: true, width: 120, options: [
                        { id: "eng", name: "Engineering", color: "#dbeafe" },
                        { id: "design", name: "Design", color: "#fce7f3" },
                        { id: "sales", name: "Sales", color: "#dcfce7" },
                        { id: "marketing", name: "Marketing", color: "#fef3c7" }
                    ]
                },
                { id: "email", name: "Email", type: "email", isVisible: true, width: 200 },
                { id: "phone", name: "Phone", type: "phone", isVisible: true, width: 150 }
            ],
            views: [
                {
                    id: "1",
                    name: "All Team",
                    type: "table",
                    filters: [],
                    sorts: [],
                    visibleProperties: [],
                    config: {}
                },
                {
                    id: "2",
                    name: "By Department",
                    type: "board",
                    filters: [],
                    sorts: [],
                    groupBy: "department",
                    visibleProperties: [],
                    config: {}
                }
            ],
            defaultViewId: "1"
        }
    },
    {
        id: "meeting-schedule",
        name: "Meeting Schedule",
        description: "Team calendar for meetings and events",
        category: "team",
        icon: "📅",
        color: "#8b5cf6",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Meeting", type: "title", isVisible: true, width: 250 },
                { id: "date", name: "Date & Time", type: "date", isVisible: true, width: 150 },
                {
                    id: "type", name: "Type", type: "select", isVisible: true, width: 120, options: [
                        { id: "all-hands", name: "All Hands", color: "#dbeafe" },
                        { id: "standup", name: "Standup", color: "#fef3c7" },
                        { id: "1on1", name: "1:1", color: "#fce7f3" },
                        { id: "planning", name: "Planning", color: "#dcfce7" }
                    ]
                },
                { id: "organizer", name: "Organizer", type: "text", isVisible: true, width: 150 },
                { id: "location", name: "Location", type: "text", isVisible: true, width: 150 }
            ],
            views: [{
                id: "1",
                name: "Calendar",
                type: "calendar",
                filters: [],
                sorts: [],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "knowledge-base",
        name: "Knowledge Base",
        description: "Team wiki and documentation",
        category: "team",
        icon: "📖",
        color: "#06b6d4",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Article", type: "title", isVisible: true, width: 300 },
                {
                    id: "category", name: "Category", type: "select", isVisible: true, width: 150, options: [
                        { id: "onboarding", name: "Onboarding", color: "#dbeafe" },
                        { id: "processes", name: "Processes", color: "#fef3c7" },
                        { id: "technical", name: "Technical", color: "#dcfce7" },
                        { id: "faq", name: "FAQ", color: "#fce7f3" }
                    ]
                },
                { id: "author", name: "Author", type: "text", isVisible: true, width: 150 },
                { id: "updated", name: "Last Updated", type: "date", isVisible: true, width: 120 }
            ],
            views: [{
                id: "1",
                name: "All Articles",
                type: "table",
                filters: [],
                sorts: [{ id: "sort-1", propertyId: "updated", direction: "descending" }],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },

    // Additional Personal Templates
    {
        id: "meal-planner",
        name: "Meal Planner",
        description: "Weekly meal planning and recipes",
        category: "personal",
        icon: "🍽️",
        color: "#f59e0b",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Meal", type: "title", isVisible: true, width: 250 },
                {
                    id: "day", name: "Day", type: "select", isVisible: true, width: 100, options: [
                        { id: "mon", name: "Monday", color: "#dbeafe" },
                        { id: "tue", name: "Tuesday", color: "#fef3c7" },
                        { id: "wed", name: "Wednesday", color: "#dcfce7" },
                        { id: "thu", name: "Thursday", color: "#fce7f3" },
                        { id: "fri", name: "Friday", color: "#fde68a" },
                        { id: "sat", name: "Saturday", color: "#e0e7ff" },
                        { id: "sun", name: "Sunday", color: "#fee2e2" }
                    ]
                },
                {
                    id: "type", name: "Meal Type", type: "select", isVisible: true, width: 100, options: [
                        { id: "breakfast", name: "Breakfast", color: "#fef3c7" },
                        { id: "lunch", name: "Lunch", color: "#dbeafe" },
                        { id: "dinner", name: "Dinner", color: "#dcfce7" }
                    ]
                },
                { id: "prep-time", name: "Prep Time (min)", type: "number", isVisible: true, width: 100 }
            ],
            views: [{
                id: "1",
                name: "This Week",
                type: "board",
                filters: [],
                sorts: [],
                groupBy: "day",
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "budget-tracker",
        name: "Budget Tracker",
        description: "Personal finance and expense tracking",
        category: "personal",
        icon: "💵",
        color: "#10b981",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Transaction", type: "title", isVisible: true, width: 250 },
                { id: "amount", name: "Amount", type: "number", isVisible: true, width: 100 },
                {
                    id: "category", name: "Category", type: "select", isVisible: true, width: 120, options: [
                        { id: "food", name: "Food", color: "#fef3c7" },
                        { id: "transport", name: "Transport", color: "#dbeafe" },
                        { id: "utilities", name: "Utilities", color: "#dcfce7" },
                        { id: "entertainment", name: "Entertainment", color: "#fce7f3" },
                        { id: "income", name: "Income", color: "#d1fae5" }
                    ]
                },
                { id: "date", name: "Date", type: "date", isVisible: true, width: 120 },
                { id: "notes", name: "Notes", type: "text", isVisible: true, width: 200 }
            ],
            views: [{
                id: "1",
                name: "All Transactions",
                type: "table",
                filters: [],
                sorts: [{ id: "sort-1", propertyId: "date", direction: "descending" }],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "travel-planner",
        name: "Travel Planner",
        description: "Plan trips and track travel details",
        category: "personal",
        icon: "✈️",
        color: "#06b6d4",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Destination", type: "title", isVisible: true, width: 250 },
                { id: "start-date", name: "Start Date", type: "date", isVisible: true, width: 120 },
                { id: "end-date", name: "End Date", type: "date", isVisible: true, width: 120 },
                {
                    id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                        { id: "planning", name: "Planning", color: "#e5e5e5" },
                        { id: "booked", name: "Booked", color: "#fef3c7" },
                        { id: "traveling", name: "Traveling", color: "#dbeafe" },
                        { id: "completed", name: "Completed", color: "#dcfce7" }
                    ]
                },
                { id: "budget", name: "Budget", type: "number", isVisible: true, width: 100 }
            ],
            views: [{
                id: "1",
                name: "Trips",
                type: "table",
                filters: [],
                sorts: [{ id: "sort-1", propertyId: "start-date", direction: "ascending" }],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    },
    {
        id: "fitness-tracker",
        name: "Fitness Tracker",
        description: "Track workouts and fitness goals",
        category: "personal",
        icon: "💪",
        color: "#ef4444",
        layout: DEFAULT_DATABASE_LAYOUT,
        databaseConfig: {
            properties: [
                { id: "title", name: "Workout", type: "title", isVisible: true, width: 250 },
                { id: "date", name: "Date", type: "date", isVisible: true, width: 120 },
                {
                    id: "type", name: "Type", type: "select", isVisible: true, width: 120, options: [
                        { id: "cardio", name: "Cardio", color: "#fee2e2" },
                        { id: "strength", name: "Strength", color: "#dbeafe" },
                        { id: "yoga", name: "Yoga", color: "#dcfce7" },
                        { id: "sports", name: "Sports", color: "#fef3c7" }
                    ]
                },
                { id: "duration", name: "Duration (min)", type: "number", isVisible: true, width: 100 },
                { id: "calories", name: "Calories", type: "number", isVisible: true, width: 100 }
            ],
            views: [{
                id: "1",
                name: "Workout Log",
                type: "table",
                filters: [],
                sorts: [{ id: "sort-1", propertyId: "date", direction: "descending" }],
                visibleProperties: [],
                config: {}
            }],
            defaultViewId: "1"
        }
    }
];

export const TEMPLATE_CATEGORIES = [
    { id: "productivity", name: "Productivity", icon: "⚡", color: "#3b82f6" },
    { id: "project_management", name: "Project Management", icon: "📊", color: "#8b5cf6" },
    { id: "crm", name: "CRM & Sales", icon: "💼", color: "#ec4899" },
    { id: "content", name: "Content & Media", icon: "✍️", color: "#f59e0b" },
    { id: "personal", name: "Personal", icon: "🏠", color: "#10b981" },
    { id: "team", name: "Team & HR", icon: "👥", color: "#6366f1" }
];
