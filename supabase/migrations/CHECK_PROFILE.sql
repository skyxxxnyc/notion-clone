-- Check current user ID
SELECT 'Current user ID: ' || COALESCE(auth.uid()::text, 'NOT AUTHENTICATED') as info;

-- Check if profile exists
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
        THEN 'Profile EXISTS'
        ELSE 'Profile MISSING - THIS IS THE PROBLEM'
    END as status;

-- Try to select from workspace_members
SELECT COUNT(*) as total_workspace_members FROM workspace_members;

-- Try to select workspace_members for current user
SELECT * FROM workspace_members WHERE user_id = auth.uid();
