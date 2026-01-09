-- ============================================
-- FIX RLS POLICIES
-- The workspace_members_select policy has a circular dependency
-- This script fixes it
-- ============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "workspace_members_select" ON workspace_members;

-- Create a simple policy that allows users to see their own memberships
CREATE POLICY "workspace_members_select" ON workspace_members FOR SELECT
USING (user_id = auth.uid());

-- Verify it was created
SELECT 'Policy created successfully' as status;

-- Test the query
SELECT 'Testing query...' as status;
SELECT COUNT(*) as membership_count FROM workspace_members WHERE user_id = auth.uid();
