-- Check current user
SELECT auth.uid() as my_user_id;

-- Check profiles
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT * FROM profiles WHERE id = auth.uid();

-- Check workspaces
SELECT COUNT(*) as total_workspaces FROM workspaces;
SELECT * FROM workspaces;
