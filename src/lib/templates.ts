import { DatabaseConfig } from "@/types";
import { DatabaseLayout, DEFAULT_DATABASE_LAYOUT, TABBED_PROJECT_LAYOUT, CRM_CONTACT_LAYOUT } from "@/types/layout";

export interface Template {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    icon: string;
    color: string;
    databaseConfig: DatabaseConfig;
    layout: DatabaseLayout;
}

export type TemplateCategory =
    | "productivity"
    | "project_management"
    | "crm"
    | "content"
    | "personal"
    | "team";

export const TEMPLATE_LIBRARY: Template[] = [
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
                { id: "frequency", name: "Frequency", type: "select", isVisible: true, width: 120, options: [
                    { id: "daily", name: "Daily", color: "#dbeafe" },
                    { id: "weekly", name: "Weekly", color: "#fef3c7" }
                ]},
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
                { id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                    { id: "to-read", name: "To Read", color: "#e5e5e5" },
                    { id: "reading", name: "Reading", color: "#fef3c7" },
                    { id: "finished", name: "Finished", color: "#dcfce7" }
                ]},
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
                { id: "status", name: "Status", type: "status", isVisible: true, width: 120, options: [
                    { id: "planning", name: "Planning", color: "#e0e7ff" },
                    { id: "active", name: "Active", color: "#fef3c7" },
                    { id: "on-hold", name: "On Hold", color: "#fee2e2" },
                    { id: "completed", name: "Completed", color: "#dcfce7" }
                ]},
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
                { id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                    { id: "backlog", name: "Backlog", color: "#e5e5e5" },
                    { id: "todo", name: "To Do", color: "#dbeafe" },
                    { id: "in-progress", name: "In Progress", color: "#fef3c7" },
                    { id: "review", name: "Review", color: "#fde68a" },
                    { id: "done", name: "Done", color: "#dcfce7" }
                ]},
                { id: "points", name: "Story Points", type: "number", isVisible: true, width: 80 },
                { id: "assignee", name: "Assignee", type: "text", isVisible: true, width: 150 },
                { id: "sprint", name: "Sprint", type: "select", isVisible: true, width: 100, options: [
                    { id: "sprint-1", name: "Sprint 1", color: "#dbeafe" },
                    { id: "sprint-2", name: "Sprint 2", color: "#fef3c7" }
                ]}
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
                { id: "quarter", name: "Quarter", type: "select", isVisible: true, width: 100, options: [
                    { id: "q1", name: "Q1", color: "#dbeafe" },
                    { id: "q2", name: "Q2", color: "#fef3c7" },
                    { id: "q3", name: "Q3", color: "#fde68a" },
                    { id: "q4", name: "Q4", color: "#dcfce7" }
                ]},
                { id: "priority", name: "Priority", type: "select", isVisible: true, width: 100, options: [
                    { id: "p0", name: "P0", color: "#fee2e2" },
                    { id: "p1", name: "P1", color: "#fef3c7" },
                    { id: "p2", name: "P2", color: "#dbeafe" }
                ]},
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
                { id: "category", name: "Category", type: "select", isVisible: true, width: 120, options: [
                    { id: "client", name: "Client", color: "#dcfce7" },
                    { id: "prospect", name: "Prospect", color: "#fef3c7" },
                    { id: "partner", name: "Partner", color: "#dbeafe" }
                ]}
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
                { id: "stage", name: "Stage", type: "select", isVisible: true, width: 150, options: [
                    { id: "lead", name: "Lead", color: "#e5e5e5" },
                    { id: "qualified", name: "Qualified", color: "#dbeafe" },
                    { id: "proposal", name: "Proposal", color: "#fef3c7" },
                    { id: "negotiation", name: "Negotiation", color: "#fde68a" },
                    { id: "closed-won", name: "Closed Won", color: "#dcfce7" },
                    { id: "closed-lost", name: "Closed Lost", color: "#fee2e2" }
                ]},
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
                { id: "status", name: "Status", type: "select", isVisible: true, width: 150, options: [
                    { id: "wishlist", name: "Wishlist", color: "#e5e5e5" },
                    { id: "applied", name: "Applied", color: "#dbeafe" },
                    { id: "phone-screen", name: "Phone Screen", color: "#fef3c7" },
                    { id: "interview", name: "Interview", color: "#fde68a" },
                    { id: "offer", name: "Offer", color: "#dcfce7" },
                    { id: "rejected", name: "Rejected", color: "#fee2e2" }
                ]},
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
                { id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                    { id: "idea", name: "Idea", color: "#e5e5e5" },
                    { id: "draft", name: "Draft", color: "#fef3c7" },
                    { id: "review", name: "Review", color: "#fde68a" },
                    { id: "published", name: "Published", color: "#dcfce7" }
                ]},
                { id: "author", name: "Author", type: "text", isVisible: true, width: 150 },
                { id: "publish-date", name: "Publish Date", type: "date", isVisible: true, width: 120 },
                { id: "tags", name: "Tags", type: "multiSelect", isVisible: true, width: 200, options: [
                    { id: "tech", name: "Tech", color: "#dbeafe" },
                    { id: "business", name: "Business", color: "#fef3c7" },
                    { id: "tutorial", name: "Tutorial", color: "#dcfce7" }
                ]}
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
                { id: "platform", name: "Platform", type: "multiSelect", isVisible: true, width: 150, options: [
                    { id: "twitter", name: "Twitter", color: "#dbeafe" },
                    { id: "linkedin", name: "LinkedIn", color: "#e0e7ff" },
                    { id: "instagram", name: "Instagram", color: "#fce7f3" }
                ]},
                { id: "date", name: "Post Date", type: "date", isVisible: true, width: 120 },
                { id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                    { id: "draft", name: "Draft", color: "#e5e5e5" },
                    { id: "scheduled", name: "Scheduled", color: "#fef3c7" },
                    { id: "posted", name: "Posted", color: "#dcfce7" }
                ]}
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
                { id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                    { id: "scripting", name: "Scripting", color: "#e5e5e5" },
                    { id: "filming", name: "Filming", color: "#fef3c7" },
                    { id: "editing", name: "Editing", color: "#fde68a" },
                    { id: "published", name: "Published", color: "#dcfce7" }
                ]},
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
                { id: "department", name: "Department", type: "select", isVisible: true, width: 120, options: [
                    { id: "eng", name: "Engineering", color: "#dbeafe" },
                    { id: "design", name: "Design", color: "#fce7f3" },
                    { id: "sales", name: "Sales", color: "#dcfce7" },
                    { id: "marketing", name: "Marketing", color: "#fef3c7" }
                ]},
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
                { id: "type", name: "Type", type: "select", isVisible: true, width: 120, options: [
                    { id: "all-hands", name: "All Hands", color: "#dbeafe" },
                    { id: "standup", name: "Standup", color: "#fef3c7" },
                    { id: "1on1", name: "1:1", color: "#fce7f3" },
                    { id: "planning", name: "Planning", color: "#dcfce7" }
                ]},
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
                { id: "category", name: "Category", type: "select", isVisible: true, width: 150, options: [
                    { id: "onboarding", name: "Onboarding", color: "#dbeafe" },
                    { id: "processes", name: "Processes", color: "#fef3c7" },
                    { id: "technical", name: "Technical", color: "#dcfce7" },
                    { id: "faq", name: "FAQ", color: "#fce7f3" }
                ]},
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
                { id: "day", name: "Day", type: "select", isVisible: true, width: 100, options: [
                    { id: "mon", name: "Monday", color: "#dbeafe" },
                    { id: "tue", name: "Tuesday", color: "#fef3c7" },
                    { id: "wed", name: "Wednesday", color: "#dcfce7" },
                    { id: "thu", name: "Thursday", color: "#fce7f3" },
                    { id: "fri", name: "Friday", color: "#fde68a" },
                    { id: "sat", name: "Saturday", color: "#e0e7ff" },
                    { id: "sun", name: "Sunday", color: "#fee2e2" }
                ]},
                { id: "type", name: "Meal Type", type: "select", isVisible: true, width: 100, options: [
                    { id: "breakfast", name: "Breakfast", color: "#fef3c7" },
                    { id: "lunch", name: "Lunch", color: "#dbeafe" },
                    { id: "dinner", name: "Dinner", color: "#dcfce7" }
                ]},
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
                { id: "category", name: "Category", type: "select", isVisible: true, width: 120, options: [
                    { id: "food", name: "Food", color: "#fef3c7" },
                    { id: "transport", name: "Transport", color: "#dbeafe" },
                    { id: "utilities", name: "Utilities", color: "#dcfce7" },
                    { id: "entertainment", name: "Entertainment", color: "#fce7f3" },
                    { id: "income", name: "Income", color: "#d1fae5" }
                ]},
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
                { id: "status", name: "Status", type: "select", isVisible: true, width: 120, options: [
                    { id: "planning", name: "Planning", color: "#e5e5e5" },
                    { id: "booked", name: "Booked", color: "#fef3c7" },
                    { id: "traveling", name: "Traveling", color: "#dbeafe" },
                    { id: "completed", name: "Completed", color: "#dcfce7" }
                ]},
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
                { id: "type", name: "Type", type: "select", isVisible: true, width: 120, options: [
                    { id: "cardio", name: "Cardio", color: "#fee2e2" },
                    { id: "strength", name: "Strength", color: "#dbeafe" },
                    { id: "yoga", name: "Yoga", color: "#dcfce7" },
                    { id: "sports", name: "Sports", color: "#fef3c7" }
                ]},
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
