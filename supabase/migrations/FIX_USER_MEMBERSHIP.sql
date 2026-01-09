-- ============================================
-- FIX USER MEMBERSHIP
-- Ensure all users have workspace memberships
-- ============================================

-- Show all users
SELECT 'All auth users:' as section;
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Show all profiles
SELECT 'All profiles:' as section;
SELECT id, name, email FROM profiles;

-- Show all workspaces
SELECT 'All workspaces:' as section;
SELECT id, name, owner_id FROM workspaces;

-- Show all workspace_members
SELECT 'All workspace_members:' as section;
SELECT workspace_id, user_id, role FROM workspace_members;

-- Create workspace memberships for any user who owns a workspace but isn't a member
INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
SELECT
    w.id as workspace_id,
    w.owner_id as user_id,
    'owner' as role,
    NOW() as joined_at
FROM workspaces w
WHERE NOT EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = w.id AND wm.user_id = w.owner_id
);

SELECT 'Fixed memberships' as status;

-- Show final state
SELECT 'Final workspace_members:' as section;
SELECT wm.workspace_id, wm.user_id, wm.role, u.email as user_email, w.name as workspace_name
FROM workspace_members wm
JOIN auth.users u ON wm.user_id = u.id
JOIN workspaces w ON wm.workspace_id = w.id;
