# Database Error Fix Guide

## What's Happening

You're seeing a `42P17` error which means PostgreSQL can't find a column it's looking for. This usually means:
1. The database tables aren't set up correctly
2. Column names don't match what the code expects
3. RLS policies are blocking access completely

## Quick Fix (Most Likely Solution)

### Step 1: Run the Diagnostic

1. Go to: https://supabase.com/dashboard/project/shdkmevlhvlcftrofjzr/sql/new
2. Copy the entire contents of `supabase/migrations/DIAGNOSTIC.sql`
3. Paste into the SQL Editor
4. Click "Run" or press Cmd+Enter
5. Look at the results

**What you're looking for:**
- Under "TABLES THAT EXIST" - should show 5 tables
- Under "WORKSPACE_MEMBERS COLUMNS" - should show workspace_id, user_id, role, joined_at
- Under "CURRENT USER PROFILE" - should say "Profile EXISTS"

### Step 2: If Diagnostic Shows Problems

If you see missing tables, wrong column names, or missing profile:

1. Open a NEW query in Supabase SQL Editor
2. Copy the ENTIRE contents of `supabase/migrations/FINAL_FIX.sql` (all 278 lines)
3. Paste into SQL Editor
4. Click "Run"
5. Wait 5-10 seconds for completion

### Step 3: Clear Everything and Restart

```bash
# In your browser:
# 1. Open DevTools (F12)
# 2. Application tab → Local Storage → http://localhost:3000 → Clear
# 3. Right-click refresh button → Empty Cache and Hard Reload

# In your terminal:
# Stop the server (Ctrl+C) and restart
npm run dev
```

### Step 4: Check Console

Open http://localhost:3000 and check the browser console. You should now see detailed logs:
- "Raw memberships: ..." (from getWorkspaces)
- "Workspace IDs: ..." (from getWorkspaces)
- "Workspaces found: ..." (from getWorkspaces)

If you still see errors, they'll now include helpful messages telling you exactly what to do.

## Files to Know About

- **DIAGNOSTIC.sql** - Shows you what's actually in your database
- **FINAL_FIX.sql** - Nuclear reset that rebuilds everything
- **FIX_DATABASE.md** - Detailed troubleshooting guide
- **TROUBLESHOOTING.md** - Step-by-step diagnostic instructions

## Still Broken?

If after running FINAL_FIX.sql you still get errors:

1. Run DIAGNOSTIC.sql again
2. Copy the COMPLETE output from DIAGNOSTIC.sql
3. Copy the COMPLETE browser console output
4. Share both with me

This will show me exactly what state your database is in and what's going wrong.

## Common Issues

### "relation already exists"
This is OK - it means some tables already exist. FINAL_FIX.sql will drop and recreate them.

### "permission denied" (42501)
Your user doesn't have a profile in the profiles table, or RLS policies are wrong. FINAL_FIX.sql fixes this.

### "undefined column" (42P17) - YOUR CURRENT ERROR
Column names don't match. This happens if:
- Old migration ran with different schema
- Tables were created manually with different names
- You're querying the wrong table

FINAL_FIX.sql completely drops and recreates everything with the correct schema.

## What FINAL_FIX.sql Does

1. **Disables RLS temporarily** - So we can work without restrictions
2. **Drops ALL policies** - Removes any conflicting rules
3. **Drops ALL triggers** - Removes old automation
4. **Drops ALL tables** - Complete cleanup
5. **Recreates tables** - With correct schema
6. **Recreates policies** - With correct permissions
7. **Recreates trigger** - Auto-creates profiles on signup
8. **Syncs existing users** - Creates profiles for anyone who already signed up

It's a complete teardown and rebuild.

## Technical Details

The error `42P17` specifically means PostgreSQL encountered a column reference that doesn't exist. In your case, it's likely happening when querying `workspace_members` table.

The code expects these columns:
```sql
workspace_members (
    workspace_id UUID,
    user_id UUID,
    role TEXT,
    joined_at TIMESTAMPTZ
)
```

If your table has different column names (e.g., `workspaceId` instead of `workspace_id`), you'll get this error.

DIAGNOSTIC.sql will show you the actual column names, and FINAL_FIX.sql will recreate the table with the correct names.
