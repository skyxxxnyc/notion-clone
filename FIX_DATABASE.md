# How to Fix the Database Error (42P17)

The `42P17` error means PostgreSQL can't find a column. This happens when:
1. Tables don't exist
2. Tables have wrong column names
3. RLS is blocking queries completely

## STEP 1: Run Diagnostic

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/shdkmevlhvlcftrofjzr
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**
4. Open this file: `supabase/migrations/DIAGNOSTIC.sql`
5. Copy ALL the contents
6. Paste into SQL Editor
7. Click **"Run"** (or Cmd/Ctrl + Enter)

## STEP 2: Analyze the Results

Look at the output and check:

### A. Do tables exist?
Under "TABLES THAT EXIST" you should see:
- `blocks`
- `pages`
- `profiles`
- `workspace_members`
- `workspaces`

**If ANY are missing** → Go to STEP 3 (Nuclear Reset)

### B. Do columns match expected names?
Under "WORKSPACE_MEMBERS COLUMNS" you should see:
- `workspace_id` (uuid)
- `user_id` (uuid)
- `role` (text)
- `joined_at` (timestamptz)

**If column names are different** → Tell me the actual names

Under "WORKSPACES COLUMNS" you should see:
- `id` (uuid)
- `name` (text)
- `icon` (text)
- `owner_id` (uuid)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**If column names are different** → Tell me the actual names

### C. Is RLS enabled?
Under "ROW LEVEL SECURITY STATUS" all tables should show "ENABLED"

**If any show "DISABLED"** → Go to STEP 3

### D. Do policies exist?
Under "ALL POLICIES" you should see multiple policies for each table

**If NO policies exist** → Go to STEP 3

### E. Can you access data?
Under "ROW COUNTS" it should show numbers (even if 0)

**If you get errors instead of counts** → Go to STEP 3

### F. Does your profile exist?
Under "CURRENT USER PROFILE" it should say "Profile EXISTS"

**If it says "Profile MISSING"** → Go to STEP 3

## STEP 3: Nuclear Reset (if diagnostic shows problems)

Only do this if STEP 1 showed missing tables, wrong columns, or RLS issues.

1. In Supabase SQL Editor, create a **new query**
2. Open this file: `supabase/migrations/FINAL_FIX.sql`
3. Copy ALL 278 lines
4. Paste into SQL Editor
5. Click **"Run"**
6. Wait for it to complete (should take 5-10 seconds)
7. You should see "Success. No rows returned"

## STEP 4: Verify the Fix

1. Run the DIAGNOSTIC.sql again (from STEP 1)
2. Check that:
   - All 5 tables exist
   - All columns have correct names
   - RLS is enabled on all tables
   - Policies exist
   - You can see row counts
   - Your profile exists

## STEP 5: Test the App

1. **Clear browser cache**:
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

2. **Clear localStorage**:
   - DevTools → Application tab → Local Storage
   - Select `http://localhost:3000`
   - Right-click → Clear
   - Refresh the page

3. **Restart dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

4. **Open app**: http://localhost:3000

5. **Check console**: You should now see detailed logs from the modified `getWorkspaces()` function:
   - "Raw memberships: ..."
   - "Workspace IDs: ..."
   - "Workspaces found: ..."

## STEP 6: If Still Broken

If you still get `42P17` after all this, share:

1. The FULL output from DIAGNOSTIC.sql
2. The FULL console output from the browser
3. Any error messages from FINAL_FIX.sql

This will tell me exactly what's wrong with your specific database.

---

## Quick Reference

- **Diagnostic script**: `supabase/migrations/DIAGNOSTIC.sql` - Shows current state
- **Nuclear reset**: `supabase/migrations/FINAL_FIX.sql` - Rebuilds everything
- **Supabase Dashboard**: https://supabase.com/dashboard/project/shdkmevlhvlcftrofjzr
- **SQL Editor**: Click "SQL Editor" in left sidebar
- **Table Editor**: Click "Table Editor" to browse data visually
