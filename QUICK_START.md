# 🚀 Quick Start: AI Column Auto-fill

## 1. Setup (One-time)

Add your AI API key to `.env.local`:

```bash
# Option 1: Google Gemini (Recommended)
GEMINI_API_KEY=your_key_here

# Option 2: Perplexity (Fallback)
PERPLEXITY_API_KEY=your_key_here
```

Get your API key:
- **Gemini**: https://makersuite.google.com/app/apikey
- **Perplexity**: https://www.perplexity.ai/settings/api

## 2. Using AI Auto-fill (3 Steps)

### Step 1: Open Column Menu
1. Go to any database table
2. Click the **▼** dropdown on a column header
3. Click **"Auto-fill column with AI"** ✨

```
┌─────────────────────────────┐
│ Name            ▼           │  ← Click here
├─────────────────────────────┤
│ Status          │ Priority  │
├─────────────────────────────┤
│ Task 1         │ Done      │ ???  ← Empty!
│ Task 2         │ In Progress│ ???  ← Empty!
└─────────────────────────────┘
```

### Step 2: Write Instructions
Tell the AI how to fill the column:

```
┌──────────────────────────────────────────┐
│ ✨ Auto-fill Column with AI              │
├──────────────────────────────────────────┤
│ Column: Priority                         │
│ Type: select                             │
│                                          │
│ How should AI fill this column?         │
│ ┌──────────────────────────────────────┐ │
│ │ Set to High if status is Done,       │ │
│ │ otherwise Medium                     │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ☑ Only fill empty cells (5 cells)       │
│                                          │
│            [Cancel]  [Auto-fill ✨]     │
└──────────────────────────────────────────┘
```

### Step 3: Watch It Work!
Progress bar shows real-time updates:

```
┌──────────────────────────────────────────┐
│ Progress: 3 / 5                          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░                   │
└──────────────────────────────────────────┘
```

**Done!** ✅
```
┌─────────────────────────────┐
│ Name            │ Priority  │
├─────────────────────────────┤
│ Task 1         │ High  ✓   │  ← Filled!
│ Task 2         │ Medium ✓  │  ← Filled!
└─────────────────────────────┘
```

## 3. Example Instructions by Column Type

### 📝 Text Column
```
"Summarize the title in 3-5 words"
"Generate a description based on title and tags"
"Extract the project name from title (everything before the colon)"
```

### 🔢 Number Column
```
"Calculate score: High priority = 10, Medium = 5, Low = 1"
"Count the number of words in the title"
"Calculate days until deadline from today"
```

### 📅 Date Column
```
"Set to 7 days from created date"
"Use the current date if status is Done"
"Set deadline to end of current month"
```

### ☑️ Checkbox Column
```
"Set to true if status is Done and updated in last 24 hours"
"Mark as urgent if priority is High"
"Check if title contains the word 'important'"
```

### 🏷️ Select Column
```
"Categorize as Work, Personal, or Other based on title"
"Set priority to High if tags include 'urgent', otherwise Medium"
"Assign status based on completion percentage"
```

### 🏷️🏷️ Multi-select Column
```
"Add relevant tags based on the title content"
"Include 'urgent' if priority is High, 'completed' if status is Done"
"Suggest categories that match the description"
```

## 4. Pro Tips 💡

### ✅ DO:
- Be specific in your instructions
- Reference other columns by name
- Test with a few rows first
- Use "Only fill empty cells" to preserve manual entries

### ❌ DON'T:
- Use vague instructions like "fill this"
- Forget to check the row count before confirming
- Auto-fill without reviewing the column type
- Run on huge datasets without testing first

## 5. Common Patterns

### Pattern 1: Conditional Logic
```
"Set to High if [condition], otherwise Medium"
"Use [value1] if [condition], else [value2]"
```

### Pattern 2: Calculations
```
"Calculate [formula] based on [column1] and [column2]"
"Sum/Average/Count [values]"
```

### Pattern 3: Transformations
```
"Convert [column] to [format]"
"Extract [part] from [column]"
"Combine [column1] and [column2]"
```

### Pattern 4: Categorization
```
"Categorize as [option1], [option2], or [option3] based on [criteria]"
"Assign to [category] if [condition]"
```

## 6. Troubleshooting

### "No AI API key configured"
→ Add `GEMINI_API_KEY` or `PERPLEXITY_API_KEY` to `.env.local`
→ Restart the dev server after adding the key

### "Auto-fill completed with errors"
→ Check browser console (F12) for details
→ Some rows may have succeeded - check the table
→ Try different instructions or fill failed rows individually

### "No rows to fill"
→ All cells already have values
→ Uncheck "Only fill empty cells" to fill all

### Values are incorrect
→ Make instructions more specific
→ Reference exact column names
→ Provide examples in the instruction

## 7. Video Walkthrough (Text Version)

```
1. Navigate to your database table
   [Table with Name, Status, Priority columns]

2. Click on Priority column dropdown ▼
   [Menu appears]

3. Click "Auto-fill column with AI" ✨
   [Dialog opens]

4. Enter instruction:
   "Set to High if status is Done, otherwise Medium"

5. Verify settings:
   ☑ Only fill empty cells (5 cells)

6. Click "Auto-fill ✨"
   [Progress bar: 1/5... 2/5... 3/5... 4/5... 5/5]

7. See results:
   "Successfully auto-filled 5 rows!"

8. Check your table:
   All Priority cells now filled! ✅
```

## 8. Next Steps

- Try it on different column types
- Experiment with complex instructions
- Combine with manual editing for best results
- Use it to quickly populate test data
- Automate repetitive data entry tasks

## 9. Advanced Examples

### Multi-condition Logic
```
"Set priority to:
- High if status is Done AND tags include 'urgent'
- Medium if status is In Progress
- Low otherwise"
```

### Date Calculations
```
"Set deadline to:
- 3 days from now if priority is High
- 7 days from now if priority is Medium
- 14 days from now if priority is Low"
```

### Text Processing
```
"Generate a summary:
- Include the project name from title
- Add the current status
- Mention key tags
Format: '[Project] - [Status] - Tags: [tags]'"
```

### Conditional Multi-select
```
"Add tags:
- Add 'urgent' if priority is High
- Add 'completed' if status is Done
- Add 'in-progress' if status is In Progress
- Keep existing tags"
```

---

## Ready to Try It? 🚀

1. ✅ Set your API key in `.env.local`
2. ✅ Open any database table
3. ✅ Click column dropdown → "Auto-fill with AI"
4. ✅ Enter instructions
5. ✅ Click Auto-fill!

**That's it!** The AI will handle the rest. ✨

---

Need help? Check [AI_COLUMN_AUTOFILL.md](./AI_COLUMN_AUTOFILL.md) for detailed documentation.
