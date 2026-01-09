# AI Enhancements Documentation

## Overview

This document describes the new AI-powered features added to the Notion clone application. These features leverage Google Gemini 2.0 Flash (with Perplexity fallback) to provide intelligent assistance throughout the application.

---

## Features

### 1. Smart Property Inference (#8)

**Location**: Import Modal → Field Mapper
**Purpose**: Automatically detect optimal property types when importing data

#### How it Works

- Analyzes column names and sample data values
- Uses AI to suggest the most appropriate property type
- Provides confidence scores for each suggestion
- Auto-generates select/multiSelect options from unique values

#### Usage

1. Import a CSV/JSON file
2. In the Field Mapper step, click **"Smart Detect"**
3. AI analyzes each column and suggests property types
4. Suggestions with >60% confidence are auto-applied
5. Review and adjust as needed

#### Example

```typescript
// Column: "Status" with values ["Active", "Pending", "Done"]
// AI suggests: type="select" with options:
// - Active (#10b981)
// - Pending (#f59e0b)
// - Done (#ef4444)
```

---

### 2. Smart Suggestions (#3)

**Location**: Page Editor (via AI Toolbar)
**Purpose**: Generate contextual suggestions for titles, tags, and next actions

#### Features

- **Title Suggestions**: Better titles for generic "Untitled" pages
- **Tag Suggestions**: 3-5 relevant tags based on content
- **Action Suggestions**: 2-3 actionable next steps

#### Usage

1. Open a page with content
2. Click the AI toolbar → **"Smart Suggestions"**
3. Review AI-generated suggestions in the side panel
4. Click **"Apply"** on any suggestion to use it

#### Context Analyzed

- Current page title
- Page content (first 500 characters)
- Existing tags
- Property values
- Page type (page vs database)

---

### 3. AI Writing Assistant (#6)

**Location**: Page Editor (via AI Toolbar when text is selected)
**Purpose**: Transform selected text with AI

#### Available Transformations

| Action | Description |
|--------|-------------|
| **Rewrite** | Rewrite for clarity and engagement |
| **Expand** | Add details, examples, context (2-3x longer) |
| **Shorten** | Condense to key points (50% shorter) |
| **Make Professional** | Convert to formal business tone |
| **Make Casual** | Convert to friendly, conversational tone |
| **Fix Grammar** | Correct spelling, grammar, punctuation |

#### Usage

1. Select text in the editor
2. Click AI toolbar
3. Choose a transformation action
4. AI replaces selected text with transformed version

---

### 4. Bulk Table Generation (#7)

**Location**: AI Toolbar → Generate Database Table
**Purpose**: Create complete databases from natural language descriptions

#### What it Generates

- Database title
- Property schema with appropriate types
- Sample rows with realistic data
- Select options with colors

#### Usage

1. Click AI toolbar → **"Generate Database Table"**
2. Describe the database you need
   - Example: *"Customer relationship management system with contacts, companies, and deal tracking"*
3. Set number of sample rows (1-50)
4. Click **"Generate Table"**
5. AI creates a complete database with data

#### Example Output

```json
{
  "title": "CRM System",
  "properties": [
    {"name": "Company", "type": "text"},
    {"name": "Contact", "type": "text"},
    {"name": "Deal Value", "type": "number"},
    {"name": "Status", "type": "select", "options": [
      {"name": "Lead", "color": "#f59e0b"},
      {"name": "Qualified", "color": "#3b82f6"},
      {"name": "Closed", "color": "#10b981"}
    ]}
  ],
  "rows": [
    {"title": "Acme Corp", "properties": {...}},
    ...
  ]
}
```

---

### 5. Auto-generate Page from Topic (#4)

**Location**: AI Toolbar → Generate Page from Topic
**Purpose**: Scaffold complete pages with sections and content

#### Page Types

| Type | Description |
|------|-------------|
| **General** | Well-structured page with relevant sections |
| **Guide** | Step-by-step guide with instructions and tips |
| **Documentation** | Technical docs with overview, features, usage |
| **Notes** | Organized notes with key points and summaries |
| **Project** | Project page with objectives, timeline, tasks |

#### Usage

1. Click AI toolbar → **"Generate Page from Topic"**
2. Enter your topic
   - Example: *"Project roadmap for mobile app launch"*
3. Select page type
4. Click **"Generate Page"**
5. AI creates a complete page structure with content

#### What's Generated

- Page title
- Icon (emoji)
- 4-6 main sections with headings
- Rich content (paragraphs, lists, quotes, callouts)
- Nested structure

---

## Technical Implementation

### API Integration

```typescript
// Primary: Google Gemini 2.0 Flash
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

// Fallback: Perplexity
const PERPLEXITY_API = "https://api.perplexity.ai/chat/completions"
```

### Environment Variables

```bash
# Required (at least one)
GEMINI_API_KEY=your_gemini_key
GOOGLE_API_KEY=your_google_key  # Alternative for Gemini
PERPLEXITY_API_KEY=your_perplexity_key  # Fallback
```

### Core Functions

#### `inferPropertyTypes()`

```typescript
inferPropertyTypes(
  columnName: string,
  sampleValues: (string | number | boolean | null)[]
): Promise<PropertySuggestion>
```

#### `generateSmartSuggestions()`

```typescript
generateSmartSuggestions(context: {
  currentTitle?: string;
  content?: string;
  existingTags?: string[];
  propertyValues?: Record<string, any>;
  pageType?: "page" | "database";
}): Promise<SmartSuggestion[]>
```

#### `transformText()`

```typescript
transformText(
  text: string,
  action: WritingAction,
  customInstruction?: string
): Promise<string>
```

#### `generateBulkTable()`

```typescript
generateBulkTable(
  description: string,
  rowCount?: number
): Promise<GeneratedTable>
```

#### `generatePageFromTopic()`

```typescript
generatePageFromTopic(
  topic: string,
  pageType?: "guide" | "documentation" | "notes" | "project" | "general"
): Promise<GeneratedPage>
```

---

## UI Components

### AIToolbar

Main entry point for all AI features

- **Location**: Page editor toolbar
- **Features**: Text transformation, page generation, table generation, suggestions

### GeneratePageModal

Modal for creating pages from topics

- **Inputs**: Topic, page type
- **Output**: Complete page structure

### GenerateTableModal

Modal for creating databases

- **Inputs**: Description, row count
- **Output**: Database with properties and sample data

### SmartSuggestions

Side panel showing AI suggestions

- **Display**: Title, tag, and action suggestions
- **Interaction**: One-click apply

---

## Best Practices

### 1. Property Inference

✅ **Do**: Use Smart Detect for CSV imports with varied data types
❌ **Don't**: Rely solely on AI for critical data types - always review

### 2. Smart Suggestions

✅ **Do**: Use when pages have substantial content (>100 words)
❌ **Don't**: Expect quality suggestions from empty pages

### 3. Text Transformation

✅ **Do**: Select complete sentences or paragraphs
❌ **Don't**: Select partial words or very short snippets

### 4. Table Generation

✅ **Do**: Provide detailed, specific descriptions
✅ **Example**: *"Project management system with tasks, assignees, priorities, due dates, and status tracking"*
❌ **Don't**: Use vague descriptions like *"make a table"*

### 5. Page Generation

✅ **Do**: Choose the appropriate page type for your use case
✅ **Do**: Provide specific topics with context
❌ **Don't**: Use overly broad topics like "notes"

---

## Performance & Limits

### Rate Limits

- **Batch Processing**: 5 items at a time with 1s delay
- **Token Limits**:
  - Property inference: 500 tokens
  - Smart suggestions: 800 tokens
  - Text transformation: 1500 tokens
  - Table generation: 3000 tokens
  - Page generation: 4000 tokens

### Caching

- AI suggestions are not cached
- Each request is fresh to ensure relevance

### Error Handling

- Automatic fallback from Gemini to Perplexity
- User-friendly error messages
- Graceful degradation (features disable if no API key)

---

## Troubleshooting

### "No AI API key configured"

**Solution**: Set `GEMINI_API_KEY` or `PERPLEXITY_API_KEY` in `.env.local`

### Smart Detect fails

**Possible causes**:

- No sample data in columns
- API rate limit exceeded
- Invalid API key

**Solution**: Check console for detailed errors, verify API key, wait and retry

### Generated content is poor quality

**Solution**:

- Provide more context in prompts
- Use more specific descriptions
- Try different page types
- Ensure source content is substantial

### Transformation doesn't preserve meaning

**Solution**:

- Select complete thoughts/sentences
- Use "Rewrite" instead of "Shorten" for important content
- Review and manually adjust as needed

---

## Future Enhancements

Potential improvements:

- [ ] Preview mode for table/page generation
- [ ] Undo/revert for AI transformations
- [ ] Custom transformation instructions
- [ ] Learning from user corrections
- [ ] Multi-language support
- [ ] Voice-to-text integration
- [ ] AI-powered search and Q&A
- [ ] Collaborative AI suggestions

---

## Related Files

### Actions

- `/src/actions/ai.ts` - Core AI functions

### Components

- `/src/components/ai/AIToolbar.tsx`
- `/src/components/ai/GeneratePageModal.tsx`
- `/src/components/ai/GenerateTableModal.tsx`
- `/src/components/ai/SmartSuggestions.tsx`
- `/src/components/import/FieldMapper.tsx` (enhanced)

### Styles

- `/src/components/ai/ai-components.css`

---

## API Reference

See inline JSDoc comments in `/src/actions/ai.ts` for detailed API documentation.
