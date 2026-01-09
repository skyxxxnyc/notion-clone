// SolopreneurOS - Complete Business Operating System

export const SOLOPRENEUR_OS = {
    name: "SolopreneurOS",
    description: "Complete operating system for solopreneurs",
    icon: "🚀",

    databases: [
        {
            id: "clients",
            name: "Client CRM",
            icon: "👥",
            description: "Manage your clients and relationships",
            properties: [
                { name: "Name", type: "title" },
                {
                    name: "Status", type: "select", options: [
                        { name: "Lead", color: "#f59e0b" },
                        { name: "Active", color: "#10b981" },
                        { name: "Completed", color: "#6b7280" },
                        { name: "Lost", color: "#ef4444" }
                    ]
                },
                { name: "Contact", type: "email" },
                { name: "Phone", type: "phone" },
                { name: "Company", type: "text" },
                { name: "Value", type: "number" },
                { name: "Next Action", type: "text" },
                { name: "Last Contact", type: "date" },
                {
                    name: "Tags", type: "multiSelect", options: [
                        { name: "High Priority", color: "#ef4444" },
                        { name: "Recurring", color: "#8b5cf6" },
                        { name: "Referral", color: "#10b981" }
                    ]
                },
                { name: "Notes", type: "text" }
            ]
        },

        {
            id: "projects",
            name: "Projects & Deliverables",
            icon: "📊",
            description: "Track all your projects and deliverables",
            properties: [
                { name: "Project", type: "title" },
                { name: "Client", type: "text" },
                {
                    name: "Status", type: "select", options: [
                        { name: "Planning", color: "#3b82f6" },
                        { name: "In Progress", color: "#f59e0b" },
                        { name: "Review", color: "#8b5cf6" },
                        { name: "Completed", color: "#10b981" },
                        { name: "On Hold", color: "#6b7280" }
                    ]
                },
                {
                    name: "Priority", type: "select", options: [
                        { name: "High", color: "#ef4444" },
                        { name: "Medium", color: "#f59e0b" },
                        { name: "Low", color: "#6b7280" }
                    ]
                },
                { name: "Start Date", type: "date" },
                { name: "Due Date", type: "date" },
                { name: "Budget", type: "number" },
                {
                    name: "Progress", type: "select", options: [
                        { name: "0%", color: "#ef4444" },
                        { name: "25%", color: "#f59e0b" },
                        { name: "50%", color: "#f59e0b" },
                        { name: "75%", color: "#10b981" },
                        { name: "100%", color: "#10b981" }
                    ]
                },
                { name: "Deliverables", type: "text" }
            ]
        },

        {
            id: "content",
            name: "Content Pipeline",
            icon: "✍️",
            description: "Plan and track your content creation",
            properties: [
                { name: "Title", type: "title" },
                {
                    name: "Type", type: "select", options: [
                        { name: "Blog Post", color: "#3b82f6" },
                        { name: "Social Media", color: "#ec4899" },
                        { name: "Newsletter", color: "#8b5cf6" },
                        { name: "Video", color: "#ef4444" },
                        { name: "Podcast", color: "#f59e0b" }
                    ]
                },
                {
                    name: "Status", type: "select", options: [
                        { name: "Idea", color: "#6b7280" },
                        { name: "Outline", color: "#3b82f6" },
                        { name: "Draft", color: "#f59e0b" },
                        { name: "Review", color: "#8b5cf6" },
                        { name: "Published", color: "#10b981" }
                    ]
                },
                {
                    name: "Platform", type: "multiSelect", options: [
                        { name: "LinkedIn", color: "#3b82f6" },
                        { name: "Twitter", color: "#3b82f6" },
                        { name: "Blog", color: "#6b7280" },
                        { name: "YouTube", color: "#ef4444" },
                        { name: "Newsletter", color: "#8b5cf6" }
                    ]
                },
                { name: "Publish Date", type: "date" },
                { name: "Topic", type: "text" },
                { name: "Keywords", type: "multiSelect" }
            ]
        },

        {
            id: "revenue",
            name: "Revenue Tracker",
            icon: "💰",
            description: "Track income and financial goals",
            properties: [
                { name: "Description", type: "title" },
                { name: "Amount", type: "number" },
                { name: "Date", type: "date" },
                { name: "Client", type: "text" },
                {
                    name: "Type", type: "select", options: [
                        { name: "Service", color: "#10b981" },
                        { name: "Product", color: "#3b82f6" },
                        { name: "Recurring", color: "#8b5cf6" },
                        { name: "One-time", color: "#f59e0b" }
                    ]
                },
                {
                    name: "Status", type: "select", options: [
                        { name: "Pending", color: "#f59e0b" },
                        { name: "Received", color: "#10b981" },
                        { name: "Overdue", color: "#ef4444" }
                    ]
                },
                { name: "Invoice #", type: "text" },
                { name: "Notes", type: "text" }
            ]
        },

        {
            id: "tasks",
            name: "Task Manager",
            icon: "✅",
            description: "Daily tasks and to-dos",
            properties: [
                { name: "Task", type: "title" },
                {
                    name: "Status", type: "select", options: [
                        { name: "To Do", color: "#6b7280" },
                        { name: "In Progress", color: "#f59e0b" },
                        { name: "Done", color: "#10b981" }
                    ]
                },
                {
                    name: "Priority", type: "select", options: [
                        { name: "Urgent", color: "#ef4444" },
                        { name: "High", color: "#f59e0b" },
                        { name: "Medium", color: "#3b82f6" },
                        { name: "Low", color: "#6b7280" }
                    ]
                },
                { name: "Due Date", type: "date" },
                { name: "Project", type: "text" },
                { name: "Time Estimate", type: "text" },
                {
                    name: "Category", type: "select", options: [
                        { name: "Client Work", color: "#10b981" },
                        { name: "Marketing", color: "#ec4899" },
                        { name: "Admin", color: "#6b7280" },
                        { name: "Learning", color: "#3b82f6" }
                    ]
                }
            ]
        },

        {
            id: "goals",
            name: "Goals & OKRs",
            icon: "🎯",
            description: "Track your business goals and objectives",
            properties: [
                { name: "Goal", type: "title" },
                {
                    name: "Type", type: "select", options: [
                        { name: "Revenue", color: "#10b981" },
                        { name: "Growth", color: "#3b82f6" },
                        { name: "Product", color: "#8b5cf6" },
                        { name: "Personal", color: "#f59e0b" }
                    ]
                },
                {
                    name: "Timeline", type: "select", options: [
                        { name: "This Week", color: "#ef4444" },
                        { name: "This Month", color: "#f59e0b" },
                        { name: "This Quarter", color: "#3b82f6" },
                        { name: "This Year", color: "#8b5cf6" }
                    ]
                },
                {
                    name: "Progress", type: "select", options: [
                        { name: "Not Started", color: "#6b7280" },
                        { name: "On Track", color: "#10b981" },
                        { name: "At Risk", color: "#f59e0b" },
                        { name: "Achieved", color: "#10b981" }
                    ]
                },
                { name: "Target", type: "text" },
                { name: "Current", type: "text" },
                { name: "Due Date", type: "date" }
            ]
        },

        {
            id: "ideas",
            name: "Ideas & Opportunities",
            icon: "💡",
            description: "Capture ideas and business opportunities",
            properties: [
                { name: "Idea", type: "title" },
                {
                    name: "Category", type: "select", options: [
                        { name: "Product", color: "#3b82f6" },
                        { name: "Service", color: "#10b981" },
                        { name: "Content", color: "#ec4899" },
                        { name: "Partnership", color: "#8b5cf6" },
                        { name: "Marketing", color: "#f59e0b" }
                    ]
                },
                {
                    name: "Priority", type: "select", options: [
                        { name: "High", color: "#ef4444" },
                        { name: "Medium", color: "#f59e0b" },
                        { name: "Low", color: "#6b7280" }
                    ]
                },
                {
                    name: "Status", type: "select", options: [
                        { name: "New", color: "#3b82f6" },
                        { name: "Researching", color: "#f59e0b" },
                        { name: "Planning", color: "#8b5cf6" },
                        { name: "Implementing", color: "#10b981" },
                        { name: "Archived", color: "#6b7280" }
                    ]
                },
                { name: "Potential Value", type: "text" },
                {
                    name: "Effort", type: "select", options: [
                        { name: "Low", color: "#10b981" },
                        { name: "Medium", color: "#f59e0b" },
                        { name: "High", color: "#ef4444" }
                    ]
                },
                { name: "Notes", type: "text" }
            ]
        },

        {
            id: "knowledge",
            name: "Knowledge Base",
            icon: "📚",
            description: "Store processes, templates, and learnings",
            properties: [
                { name: "Title", type: "title" },
                {
                    name: "Type", type: "select", options: [
                        { name: "Process", color: "#3b82f6" },
                        { name: "Template", color: "#8b5cf6" },
                        { name: "Guide", color: "#10b981" },
                        { name: "Resource", color: "#f59e0b" },
                        { name: "Learning", color: "#ec4899" }
                    ]
                },
                {
                    name: "Category", type: "multiSelect", options: [
                        { name: "Sales", color: "#10b981" },
                        { name: "Marketing", color: "#ec4899" },
                        { name: "Operations", color: "#3b82f6" },
                        { name: "Finance", color: "#f59e0b" },
                        { name: "Tools", color: "#6b7280" }
                    ]
                },
                { name: "Last Updated", type: "date" },
                { name: "Tags", type: "multiSelect" }
            ]
        }
    ],

    pages: [
        {
            id: "dashboard",
            name: "📊 Dashboard",
            description: "Your business command center",
            layout: "default",
            content: `<h1>Welcome to Your SolopreneurOS</h1>
<p>Your complete business operating system in one place.</p>

<h2>Quick Stats</h2>
<p>• Active Clients: [Link to Client CRM]</p>
<p>• Projects in Progress: [Link to Projects]</p>
<p>• This Month's Revenue: [Link to Revenue Tracker]</p>
<p>• Tasks Due Today: [Link to Task Manager]</p>

<h2>Today's Focus</h2>
<p>What are your top 3 priorities today?</p>
<ol>
  <li></li>
  <li></li>
  <li></li>
</ol>

<h2>Quick Links</h2>
<p>• Client CRM</p>
<p>• Projects & Deliverables</p>
<p>• Content Pipeline</p>
<p>• Revenue Tracker</p>
<p>• Task Manager</p>`
        },

        {
            id: "weekly-review",
            name: "📅 Weekly Review Template",
            description: "Weekly reflection and planning",
            layout: "default",
            content: `<h1>Weekly Review - Week of [DATE]</h1>

<h2>🎯 Last Week's Wins</h2>
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>

<h2>📊 Metrics Review</h2>
<p><strong>Revenue:</strong> $</p>
<p><strong>New Clients:</strong> </p>
<p><strong>Content Published:</strong> </p>
<p><strong>Tasks Completed:</strong> </p>

<h2>🔍 What Went Well</h2>
<p></p>

<h2>⚠️ Challenges & Blockers</h2>
<p></p>

<h2>📚 Key Learnings</h2>
<p></p>

<h2>🎯 Next Week's Goals</h2>
<ol>
  <li></li>
  <li></li>
  <li></li>
</ol>

<h2>✅ Action Items</h2>
<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>`
        },

        {
            id: "client-onboarding",
            name: "👋 Client Onboarding Checklist",
            description: "Streamline new client onboarding",
            layout: "default",
            content: `<h1>Client Onboarding Checklist</h1>

<h2>Pre-Kickoff</h2>
<ul>
  <li>☐ Send welcome email</li>
  <li>☐ Send contract & get signature</li>
  <li>☐ Send invoice</li>
  <li>☐ Add to Client CRM</li>
  <li>☐ Create project in Projects database</li>
  <li>☐ Set up communication channels</li>
</ul>

<h2>Kickoff Meeting</h2>
<ul>
  <li>☐ Review project scope</li>
  <li>☐ Set expectations & timeline</li>
  <li>☐ Gather requirements</li>
  <li>☐ Schedule regular check-ins</li>
  <li>☐ Share relevant resources</li>
</ul>

<h2>Project Setup</h2>
<ul>
  <li>☐ Create project folder/workspace</li>
  <li>☐ Set up project management board</li>
  <li>☐ Define deliverables</li>
  <li>☐ Create timeline</li>
  <li>☐ Assign tasks</li>
</ul>

<h2>First Week</h2>
<ul>
  <li>☐ Send progress update</li>
  <li>☐ Address any questions</li>
  <li>☐ Confirm next steps</li>
</ul>`
        },

        {
            id: "content-workflow",
            name: "✍️ Content Creation Workflow",
            description: "Your content production process",
            layout: "default",
            content: `<h1>Content Creation Workflow</h1>

<h2>1. Ideation</h2>
<p>• Brainstorm topics based on audience needs</p>
<p>• Check trending topics in your niche</p>
<p>• Review analytics for top-performing content</p>
<p>• Add ideas to Content Pipeline database</p>

<h2>2. Planning</h2>
<p>• Select topic from pipeline</p>
<p>• Research keywords</p>
<p>• Create outline</p>
<p>• Set publish date</p>

<h2>3. Creation</h2>
<p>• Write first draft</p>
<p>• Add visuals/media</p>
<p>• Format for platform</p>
<p>• Create social media snippets</p>

<h2>4. Review</h2>
<p>• Edit for clarity</p>
<p>• Check grammar & spelling</p>
<p>• Optimize for SEO</p>
<p>• Get feedback if needed</p>

<h2>5. Publishing</h2>
<p>• Schedule post</p>
<p>• Prepare social promotion</p>
<p>• Update Content Pipeline status</p>

<h2>6. Promotion</h2>
<p>• Share on social media</p>
<p>• Email to newsletter list</p>
<p>• Engage with comments</p>
<p>• Repurpose for other platforms</p>

<h2>7. Analysis</h2>
<p>• Track performance metrics</p>
<p>• Note what worked well</p>
<p>• Apply learnings to next piece</p>`
        }
    ]
};

export type SolopreneurDatabase = typeof SOLOPRENEUR_OS.databases[number];
export type SolopreneurPage = typeof SOLOPRENEUR_OS.pages[number];
