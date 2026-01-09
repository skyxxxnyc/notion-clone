# AI Column Auto-fill Feature

## Overview
The AI Column Auto-fill feature allows you to automatically populate entire columns in your database tables using AI. The AI analyzes the content of other columns in each row and generates appropriate values based on your instructions.

## Features

### 🎯 Smart Context-Aware Generation
- AI considers all other columns in each row when generating values
- Understands the column type and generates appropriate formatted output
- Supports batch processing with progress tracking

### 🔧 Supported Property Types
- **Text**: Plain text generation
- **Number**: Numeric values
- **Date**: Date values in YYYY-MM-DD format
- **URL**: Valid URL generation
- **Email**: Email address generation
- **Phone**: Phone number generation
- **Checkbox**: Boolean true/false values
- **Select**: Single option selection
- **Multi-select**: Multiple comma-separated options
- **Status**: Status values (Todo, In Progress, Done, etc.)

### ⚙️ Configuration Options
- **Skip Existing Values**: Only fill empty cells (default: enabled)
- **Custom Instructions**: Natural language instructions for how to fill the column
- **Batch Processing**: Processes 5 rows at a time to avoid rate limits
- **Progress Tracking**: Real-time progress bar showing completion status

## How to Use

### Step 1: Open Column Menu
1. Navigate to any database table view
2. Click the dropdown arrow (▼) next to any column header
3. Select **"Auto-fill column with AI"** from the menu

### Step 2: Configure Auto-fill
In the dialog that appears:

1. **Review Column Info**: Confirm the column name and type
2. **Enter Instructions**: Describe how the AI should fill the column
3. **Configure Options**:
   - Check/uncheck "Only fill empty cells" as needed
   - The dialog shows how many cells will be filled

### Step 3: Execute
1. Click the **"Auto-fill"** button
2. Watch the progress bar as the AI generates values
3. Review the results when complete

## Example Instructions

### For a "Priority" column (Select):
```
Calculate priority: High if status is urgent, otherwise Medium
```

### For a "Summary" column (Text):
```
Summarize the title in 3-5 words
```

### For a "Description" column (Text):
```
Generate a brief description based on the title and tags
```

### For a "Deadline" column (Date):
```
Set deadline to 7 days from the created date
```

### For a "Category" column (Select):
```
Categorize based on the title: Work, Personal, or Other
```

### For a "Needs Review" column (Checkbox):
```
Set to true if status is "Done" and updated in the last 24 hours
```

## Technical Details

### API Integration
The feature uses the AI API configured in your environment:
- **Primary**: Google Gemini 2.0 Flash (via `GEMINI_API_KEY`)
- **Fallback**: Perplexity API (via `PERPLEXITY_API_KEY`)

### Batch Processing
- Processes 5 rows simultaneously
- 1-second delay between batches to respect rate limits
- Automatic retry on individual row failures (errors logged but don't stop the process)

### Error Handling
- Individual row failures are logged but don't stop the entire operation
- Success and failure counts are shown in the final summary
- Detailed error messages logged to console for debugging

## Code Architecture

### Key Files

#### `/src/actions/ai.ts`
Contains the core AI functions:
- `autoFillColumn()`: Main function that processes an entire column
- `generateCellContent()`: Existing function for single cell generation
- Batch processing logic with progress tracking
- Type-specific post-processing for each property type

#### `/src/components/database/views/TableView.tsx`
UI components:
- Auto-fill menu item in column dropdown
- Auto-fill configuration dialog
- Progress tracking UI
- Integration with database store for updating values

### Type Definitions

```typescript
interface RowData {
  rowId: string;
  title: string;
  properties: Record<string, any>;
}

interface AutoFillColumnResult {
  rowId: string;
  value: any;
  error?: string;
}

interface AutoFillOptions {
  skipExisting?: boolean;
  propertyOptions?: any[];
  batchSize?: number;
}
```

### Usage Example (Programmatic)

```typescript
import { autoFillColumn, type RowData } from "@/actions/ai";

const rows: RowData[] = [
  { rowId: "1", title: "Task 1", properties: { status: "Done" } },
  { rowId: "2", title: "Task 2", properties: { status: "In Progress" } }
];

const results = await autoFillColumn(
  "Priority",          // Column name
  "select",            // Property type
  rows,                // Row data
  "Set High if status is Done, otherwise Medium", // Instruction
  {
    skipExisting: true,
    batchSize: 5
  }
);

// Process results
for (const result of results) {
  if (result.error) {
    console.error(`Failed: ${result.rowId}`, result.error);
  } else {
    console.log(`Success: ${result.rowId} = ${result.value}`);
  }
}
```

## Best Practices

### 1. Be Specific in Instructions
❌ Bad: "Fill this column"
✅ Good: "Extract the project name from the title (everything before the colon)"

### 2. Reference Other Columns
✅ "Calculate score based on priority (High=10, Medium=5, Low=1) and status (Done=2x multiplier)"

### 3. Use Column Context
✅ "Assign category based on tags: if tags include 'urgent', use High Priority"

### 4. Consider Data Consistency
- Use "Only fill empty cells" to preserve manually entered data
- Review a sample before filling hundreds of rows
- Test with a small dataset first

### 5. Handle Edge Cases
✅ "Generate email as firstname.lastname@company.com, or use 'unknown@company.com' if name is empty"

## Limitations

1. **API Rate Limits**: Processes 5 rows at a time with 1-second delays
2. **Token Limits**: Each generation is limited to 200 tokens (configurable)
3. **Context Size**: Very large datasets may need to be processed in chunks
4. **AI Accuracy**: Generated values should be reviewed for accuracy
5. **API Key Required**: Requires GEMINI_API_KEY or PERPLEXITY_API_KEY environment variable

## Troubleshooting

### Issue: "No AI API key configured"
**Solution**: Set either `GEMINI_API_KEY` or `PERPLEXITY_API_KEY` in your `.env.local` file

### Issue: Auto-fill fails for all rows
**Solution**:
- Check console for detailed error messages
- Verify API key is valid
- Check network connectivity
- Ensure API has available quota

### Issue: Some rows fail but others succeed
**Solution**: This is normal - check console logs for specific row errors. Failed rows can be:
- Retried individually using the cell AI button
- Filled manually
- Re-attempted with different instructions

### Issue: Generated values are incorrect
**Solution**:
- Make instructions more specific
- Reference specific columns by name
- Provide examples in the instruction
- Consider the AI's understanding of the context

## Future Enhancements

Potential improvements for future versions:
- [ ] Smart instruction suggestions based on column type
- [ ] Template instructions library
- [ ] Preview mode showing 3-5 sample results before full execution
- [ ] Undo/revert auto-fill operation
- [ ] Custom batch size configuration in UI
- [ ] Multi-column auto-fill (fill several columns at once)
- [ ] Learning from manual corrections
- [ ] Export/import instruction templates

## Related Features

- **Cell AI Generation**: Individual cell generation using the Sparkles button
- **Block Editor AI**: Content generation in the block editor using `/Ask AI`
- **Template System**: Pre-configured database templates with suggested properties
