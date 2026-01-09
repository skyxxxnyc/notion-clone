-- ============================================
-- COMPREHENSIVE DIAGNOSTIC
-- Run this in Supabase SQL Editor to diagnose issues
-- ============================================

-- Show current authenticated user
SELECT 'CURRENT USER: ' || COALESCE(auth.uid()::text, 'NOT AUTHENTICATED') as info;

-- Check which tables exist
SELECT '=== TABLES THAT EXIST ===' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- If workspace_members exists, show its structure
SELECT '=== WORKSPACE_MEMBERS COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'workspace_members'
ORDER BY ordinal_position;

-- If workspaces exists, show its structure
SELECT '=== WORKSPACES COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'workspaces'
ORDER BY ordinal_position;

-- If profiles exists, show its structure
SELECT '=== PROFILES COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check RLS status
SELECT '=== ROW LEVEL SECURITY STATUS ===' as info;
SELECT
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check all policies
SELECT '=== ALL POLICIES ===' as info;
SELECT
    tablename,
    policyname,
    cmd as operation,
    CASE WHEN permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END as type
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- Try to count rows in each table (will show RLS blocks)
SELECT '=== ROW COUNTS (testing RLS) ===' as info;

-- Test profiles access
SELECT 'profiles: ' || COUNT(*)::text || ' rows visible' as info FROM profiles;

-- Test workspaces access
SELECT 'workspaces: ' || COUNT(*)::text || ' rows visible' as info FROM workspaces;

-- Test workspace_members access
SELECT 'workspace_members: ' || COUNT(*)::text || ' rows visible' as info FROM workspace_members;

-- Test pages access
SELECT 'pages: ' || COUNT(*)::text || ' rows visible' as info FROM pages;

-- Test blocks access
SELECT 'blocks: ' || COUNT(*)::text || ' rows visible' as info FROM blocks;

-- Check if current user has a profile
SELECT '=== CURRENT USER PROFILE ===' as info;
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
        THEN 'Profile EXISTS for current user'
        ELSE 'Profile MISSING for current user - THIS IS A PROBLEM!'
    END as info;

-- Show auth users (limited info)
SELECT '=== AUTH USERS ===' as info;
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- Show profiles
SELECT '=== PROFILES DATA ===' as info;
SELECT id, name, email, created_at FROM profiles LIMIT 5;

-- Show workspaces
SELECT '=== WORKSPACES DATA ===' as info;
SELECT id, name, owner_id, created_at FROM workspaces LIMIT 5;

-- Show workspace members
SELECT '=== WORKSPACE_MEMBERS DATA ===' as info;
SELECT workspace_id, user_id, role, joined_at FROM workspace_members LIMIT 10;
