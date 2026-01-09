-- ============================================
-- VERIFY CURRENT DATABASE STATE
-- Run this to see what actually exists
-- ============================================

-- Check if tables exist
SELECT
    'Table: ' || tablename as info
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'workspaces', 'workspace_members', 'pages', 'blocks')
ORDER BY tablename;

-- Check columns in workspace_members
SELECT
    'Column: ' || column_name || ' (Type: ' || data_type || ')' as info
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'workspace_members'
ORDER BY ordinal_position;

-- Check columns in workspaces
SELECT
    'Column: ' || column_name || ' (Type: ' || data_type || ')' as info
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'workspaces'
ORDER BY ordinal_position;

-- Check columns in profiles
SELECT
    'Column: ' || column_name || ' (Type: ' || data_type || ')' as info
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check RLS status
SELECT
    tablename,
    CASE WHEN rowsecurity THEN 'RLS ENABLED' ELSE 'RLS DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'workspaces', 'workspace_members', 'pages', 'blocks')
ORDER BY tablename;

-- Check policies
SELECT
    schemaname,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check current user and their profile
SELECT
    'Current auth user ID: ' || id as info
FROM auth.users
WHERE email = (SELECT email FROM auth.users LIMIT 1);

-- Check if user has profile
SELECT
    'Profile exists for user: ' || id as info
FROM profiles
LIMIT 1;

-- Check workspace_members data
SELECT
    'workspace_member row: workspace_id=' || workspace_id::text || ', user_id=' || user_id::text || ', role=' || role as info
FROM workspace_members
LIMIT 10;
