# AI Features - Troubleshooting Guide

## ✅ Recent Fixes Applied

### JSON Parsing Improvements

- ✅ Added robust `extractJSON()` helper function
- ✅ Handles markdown-wrapped JSON responses
- ✅ Better error messages with detailed logging
- ✅ Validates response structure before returning

---

## 🔧 Common Issues & Solutions

### Issue 1: "Failed to generate page"

**Symptoms:**

```
Error: Failed to generate page
Page generation failed: Error: Failed to generate page
```

**Causes:**

1. No API key configured
2. Invalid API key
3. AI returned malformed JSON
4. Network timeout

**Solutions:**

#### Step 1: Check API Key

```bash
# In .env.local
GEMINI_API_KEY=your_actual_key_here
```

Verify your key is valid:

- Go to <https://makersuite.google.com/app/apikey>
- Generate a new key if needed
- Copy it exactly (no extra spaces)

#### Step 2: Check Console Logs

Open browser DevTools (F12) and look for:

```
AI Response for page generation: {...
```

This shows what the AI actually returned. If you see this, the API is working.

#### Step 3: Test with Simple Prompt

Try a very simple topic first:

- ❌ Bad: "comprehensive enterprise-level project management system"
- ✅ Good: "meeting notes"

#### Step 4: Restart Dev Server

```bash
# Kill the current server (Ctrl+C)
rm -rf .next
npm run dev
```

---

### Issue 2: "No AI API key configured"

**Solution:**

1. Create/edit `.env.local` in project root
2. Add: `GEMINI_API_KEY=your_key_here`
3. Restart dev server
4. Refresh browser

---

### Issue 3: AI Returns Empty/Invalid Data

**Check Console for:**

```
Invalid page structure: {...}
```

**Solutions:**

1. **Try different prompt** - Be more specific
2. **Check token limits** - Very complex requests may exceed limits
3. **Use fallback API** - Add `PERPLEXITY_API_KEY` as backup

---

### Issue 4: Slow Response Times

**Normal Response Times:**

- Property Inference: 2-5 seconds
- Smart Suggestions: 3-7 seconds
- Text Transform: 2-4 seconds
- Table Generation: 5-10 seconds
- Page Generation: 8-15 seconds

**If slower:**

1. Check internet connection
2. Try during off-peak hours
3. Reduce complexity of request
4. Check API quota limits

---

### Issue 5: Smart Detect Not Working

**Symptoms:**

- Button doesn't respond
- No type changes after clicking
- Console errors

**Solutions:**

#### Check Sample Data

```typescript
// Need at least 1 row with data
// Empty columns won't get good suggestions
```

#### Verify Import Flow

1. Upload CSV with actual data
2. Wait for preview to load
3. Click "Smart Detect"
4. Wait 5-10 seconds (processing all columns)
5. Check for type changes

---

### Issue 6: Text Transformation Not Working

**Common Causes:**

1. No text actually selected
2. Editor doesn't have focus
3. Selected text is too short (<10 chars)

**Solutions:**

1. Select a complete sentence or paragraph
2. Click in editor first, then select
3. Try with at least 20-30 characters

---

## 🐛 Debugging Tips

### Enable Detailed Logging

The code now includes console.log statements. Check browser console for:

```javascript
// Page Generation
"AI Response for page generation: ..."

// Property Inference
"Property inference failed: ..."

// Smart Suggestions
"Smart suggestions failed: ..."

// Table Generation
"Bulk table generation failed: ..."
```

### Test AI Connection Directly

```typescript
// In browser console
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{
      role: 'user',
      parts: [{ text: 'Hello' }]
    }]
  })
}).then(r => r.json()).then(console.log)
```

If this fails, your API key is invalid.

---

## 📊 Error Messages Decoded

### "Failed to parse AI response as JSON"

- **Meaning**: AI returned text that isn't valid JSON
- **Fix**: Check console for "Raw text:" to see what was returned
- **Action**: Try simpler prompt or different page type

### "AI returned invalid page structure"

- **Meaning**: JSON is valid but missing required fields
- **Fix**: Check console for "Invalid page structure:"
- **Action**: Report the issue with the console output

### "No AI API key configured"

- **Meaning**: Missing environment variable
- **Fix**: Add `GEMINI_API_KEY` to `.env.local`
- **Action**: Restart server after adding

### "Generation failed"

- **Meaning**: Generic error (network, timeout, etc.)
- **Fix**: Check network tab in DevTools
- **Action**: Retry or check API status

---

## ✅ Verification Checklist

Before reporting an issue, verify:

- [ ] `.env.local` exists with valid `GEMINI_API_KEY`
- [ ] Dev server restarted after adding API key
- [ ] Browser refreshed after server restart
- [ ] Console shows no CORS or network errors
- [ ] API key is valid (test with simple prompt)
- [ ] Internet connection is stable
- [ ] Not hitting API rate limits

---

## 🔍 Advanced Debugging

### Check Network Requests

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Trigger AI feature
4. Look for requests to `generativelanguage.googleapis.com`
5. Check response status (should be 200)
6. View response body for actual AI output

### Test Individual Functions

```typescript
// In browser console (after importing)
import { generatePageFromTopic } from '@/actions/ai';

generatePageFromTopic('test topic', 'general')
  .then(console.log)
  .catch(console.error);
```

---

## 📞 Getting Help

If issues persist:

1. **Check Console Logs** - Copy all errors
2. **Check Network Tab** - Screenshot failed requests
3. **Note Your Setup**:
   - API: Gemini or Perplexity?
   - Prompt: What did you enter?
   - Feature: Which AI feature?
   - Error: Exact error message?

4. **Try Minimal Example**:
   - Use "meeting notes" as topic
   - Use "general" as page type
   - If this works, issue is with complex prompts

---

## 🎯 Best Practices

### For Reliable AI Responses

1. **Use Specific Prompts**
   - ✅ "Project roadmap for mobile app with milestones"
   - ❌ "project stuff"

2. **Start Simple**
   - Test with basic prompts first
   - Gradually increase complexity

3. **Check Quotas**
   - Free tier has limits
   - Monitor usage at <https://makersuite.google.com>

4. **Handle Errors Gracefully**
   - AI can fail sometimes
   - Always have a retry option
   - Don't rely solely on AI

---

## 🔄 Quick Reset

If everything is broken:

```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Reinstall dependencies (if needed)
npm install

# 3. Verify .env.local
cat .env.local

# 4. Restart server
npm run dev

# 5. Hard refresh browser
# Mac: Cmd+Shift+R
# Windows: Ctrl+Shift+R
```

---

## ✨ Success Indicators

You'll know it's working when:

- ✅ AI Toolbar appears in page top bar
- ✅ Clicking it shows menu with options
- ✅ Console shows "AI Response for..." logs
- ✅ Generated content appears in UI
- ✅ No 500 errors in Network tab
- ✅ Response times are reasonable (5-15s)

---

**Last Updated**: After JSON parsing improvements
**Status**: All known issues addressed
