# Database Setup Guide

This guide will help you set up the Supabase database for your Notion clone.

## Quick Setup (Recommended)

### Step 1: Go to Supabase SQL Editor

1. Visit: https://supabase.com/dashboard
2. Select your project: `shdkmevlhvlcftrofjzr`
3. In the left sidebar, click **"SQL Editor"**
4. Click **"New query"**

### Step 2: Run the Complete Setup Script

1. **Copy** the entire contents of `supabase/migrations/20260109_complete_setup.sql`
2. **Paste** into the SQL editor
3. Click **"Run"** (or press Cmd/Ctrl + Enter)

That's it! The script will:
- Create all necessary tables (if they don't exist)
- Set up Row Level Security policies
- Create your user profile automatically
- Handle all edge cases

### Step 3: Verify Setup

1. Go to **"Table Editor"** in Supabase dashboard
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `workspaces`
   - ✅ `workspace_members`
   - ✅ `pages`
   - ✅ `blocks`

### Step 4: Test the App

1. **Clear browser storage**: Open DevTools → Application → Local Storage → Delete all for `localhost:3000`
2. **Refresh** your browser
3. The app should now work! ✨

## What This Sets Up

The complete setup script creates:

- **Tables**: All database tables with proper relationships
- **RLS Policies**: Row Level Security to ensure users can only access their own data
- **Triggers**: Automatically creates user profiles when someone signs up
- **User Sync**: Creates profiles for existing users

## Troubleshooting

### Still seeing permission errors (42501)?

1. **Check your profile exists**:
   - Go to Table Editor → `profiles` table
   - Look for a row with your user ID
   - If missing, the sync query at the end of the script should have created it

2. **Re-run the complete setup script**:
   - It's safe to run multiple times
   - It will skip creating tables that already exist
   - It will recreate all policies with the latest definitions

3. **Check your Supabase connection**:
   - Verify `.env.local` has the correct credentials
   - Make sure you're logged in to the app

### Error: "relation already exists"

This is normal! The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run even if tables exist.

### Error: "policy already exists"

The script drops existing policies before recreating them, so this shouldn't happen. If it does, it means the DROP POLICY statements didn't run. Try running just those lines first.

## Alternative: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
cd /Volumes/dock2tb/notion-clone

# Link to your project
supabase link --project-ref shdkmevlhvlcftrofjzr

# Run the migration
supabase db push
```

## Need Help?

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify your `.env.local` credentials match your Supabase project
3. Make sure you're signed in to the app (check for a user in auth.users table)
