# Troubleshooting Database Issues

## Current Error: 42P17 (Undefined Column)

This error means PostgreSQL can't find a column we're trying to query. Here's how to diagnose:

### Step 1: Verify Tables Exist

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/shdkmevlhvlcftrofjzr
2. Click **"Table Editor"** in left sidebar
3. Check if these tables exist:
   - `profiles`
   - `workspaces`
   - `workspace_members`
   - `pages`
   - `blocks`

**If ANY tables are missing:** Run `FINAL_FIX.sql` from the SQL Editor.

### Step 2: Check Column Names

1. Go to **"SQL Editor"** in Supabase
2. Copy and paste the contents of `supabase/migrations/VERIFY_SETUP.sql`
3. Click **"Run"**
4. Look at the results - you should see:
   - All 5 tables listed
   - Columns for each table
   - RLS status for each table
   - Existing policies

### Step 3: Verify Your User Has a Profile

1. In Table Editor, click on `profiles` table
2. Look for a row with YOUR user ID
3. **If missing:** Run this in SQL Editor:

```sql
INSERT INTO public.profiles (id, name, email, avatar_url)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', email),
    email,
    raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) DO NOTHING;
```

### Step 4: Check Actual Column Names in workspace_members

The `42P17` error suggests the column names don't match. In SQL Editor, run:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'workspace_members'
ORDER BY ordinal_position;
```

Expected columns:
- `workspace_id` (uuid)
- `user_id` (uuid)
- `role` (text)
- `joined_at` (timestamp with time zone)

**If column names are different**, we need to know the ACTUAL names to fix the queries.

### Step 5: Manually Check RLS Policies

1. In Table Editor, click on `workspace_members`
2. Click the **"RLS"** tab (Row Level Security)
3. You should see policies like:
   - "Workspace owners can add members" (INSERT)
   - "Users can view workspace members" (SELECT)
   - "Workspace owners can manage members" (DELETE)

**If no policies exist:** RLS is blocking all queries. Run `FINAL_FIX.sql`.

### Step 6: Test Direct Query

In SQL Editor, try this simple query:

```sql
SELECT * FROM workspace_members LIMIT 10;
```

**What each result means:**

- ✅ **Success with data**: Tables and RLS are working, issue is in the application code
- ✅ **Success but empty**: Tables exist but no workspace memberships yet - need to create a workspace
- ❌ **Error 42501 (insufficient privilege)**: RLS policies are too restrictive
- ❌ **Error 42P01 (relation does not exist)**: Table doesn't exist - run FINAL_FIX.sql
- ❌ **Error 42P17 (undefined column)**: The SELECT * failed, meaning table structure is corrupted

### Step 7: Nuclear Reset (if all else fails)

If nothing above works, manually delete tables and recreate:

1. Go to Table Editor
2. For each table (`blocks`, `pages`, `workspace_members`, `workspaces`, `profiles`):
   - Click on the table
   - Click **"..."** menu (top right)
   - Select **"Delete table"**
   - Confirm deletion
3. After ALL tables are deleted, run `FINAL_FIX.sql` from SQL Editor
4. Clear browser localStorage and refresh the app

## After Running Diagnostics

Please share the output from `VERIFY_SETUP.sql` so I can see:
- Which tables actually exist
- What columns are in each table
- Whether RLS is enabled
- What policies exist

This will tell me exactly what's wrong with your database schema.
