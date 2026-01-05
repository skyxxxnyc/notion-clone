# Notion Clone

A full-featured Notion clone built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Core Features
- **Block-based Editor** - Rich text editing with slash commands (Tiptap)
- **Page Hierarchy** - Nested pages with infinite depth
- **Sidebar Navigation** - Collapsible, resizable sidebar with page tree
- **Quick Search** - Cmd/Ctrl+K to search pages
- **Favourites** - Star pages for quick access
- **Page Icons & Covers** - Emoji icons and cover images

### Editor Capabilities
- Headings (H1, H2, H3)
- Bullet and numbered lists
- To-do lists with checkboxes
- Blockquotes
- Code blocks with syntax highlighting
- Image embeds
- Links
- Text formatting (bold, italic, underline, strikethrough, highlight)
- Text alignment

### Database Views
- **Table View** - Spreadsheet-like data editing
- **Board View** - Kanban-style task management
- **Calendar View** - Monthly calendar with events
- **Gallery View** - Card-based visual layout
- **List View** - Compact list display

### Other Features
- Local storage persistence (Supabase-ready)
- Workspace management
- Settings panel
- Authentication UI (ready for Supabase Auth)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Editor**: Tiptap
- **State Management**: Zustand
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
cd ~/projects/notion-clone

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Netlify

This project is configured for Netlify deployment:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

Or connect your GitHub repository to Netlify for automatic deployments.

### Environment Variables

Copy `.env.local.example` to `.env.local` and add your Supabase credentials when ready:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Project Structure

```
src/
├── app/                    # Next.js app router
├── components/
│   ├── auth/              # Authentication components
│   ├── database/          # Database views
│   │   └── views/         # Table, Board, Calendar, Gallery, List
│   ├── editor/            # Block editor components
│   ├── layout/            # App layout
│   ├── page/              # Page view components
│   ├── settings/          # Settings dialog
│   ├── sidebar/           # Sidebar navigation
│   └── ui/                # Base UI components
├── lib/                   # Utilities
├── store/                 # Zustand store
└── types/                 # TypeScript types
```

## Key Shortcuts

- `Cmd/Ctrl + K` - Quick search
- `/` - Slash commands in editor
- `Cmd/Ctrl + B` - Bold
- `Cmd/Ctrl + I` - Italic
- `Cmd/Ctrl + U` - Underline

## Adding Supabase

To add real-time sync and authentication:

1. Create a Supabase project
2. Add your credentials to `.env.local`
3. Install Supabase client: `npm install @supabase/supabase-js`
4. Replace local storage with Supabase queries in the store

## Licence

MIT
