-- ============================================
-- SETUP YOUR ACCOUNT
-- This creates your profile and default workspace
-- ============================================

-- First, let's see what auth users exist
SELECT 'Your auth users:' as info;
SELECT id, email, created_at FROM auth.users;

-- Create profiles for all auth users who don't have one
INSERT INTO profiles (id, name, email, avatar_url, created_at, updated_at)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    email,
    raw_user_meta_data->>'avatar_url',
    created_at,
    NOW()
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.users.id);

SELECT 'Profiles created/updated' as info;
SELECT id, name, email FROM profiles;

-- Create a default workspace for each user who doesn't have one
DO $$
DECLARE
    user_record RECORD;
    new_workspace_id UUID;
BEGIN
    FOR user_record IN SELECT id, email FROM auth.users LOOP
        -- Check if user already has a workspace
        IF NOT EXISTS (
            SELECT 1 FROM workspace_members WHERE user_id = user_record.id
        ) THEN
            -- Create a new workspace
            INSERT INTO workspaces (name, icon, owner_id)
            VALUES (
                split_part(user_record.email, '@', 1) || '''s Workspace',
                '🏠',
                user_record.id
            )
            RETURNING id INTO new_workspace_id;

            -- Add user as owner/member
            INSERT INTO workspace_members (workspace_id, user_id, role)
            VALUES (new_workspace_id, user_record.id, 'owner');

            RAISE NOTICE 'Created workspace % for user %', new_workspace_id, user_record.email;
        END IF;
    END LOOP;
END $$;

SELECT 'Workspaces created' as info;
SELECT w.id, w.name, w.owner_id, u.email as owner_email
FROM workspaces w
JOIN auth.users u ON w.owner_id = u.id;

SELECT 'Workspace memberships:' as info;
SELECT wm.workspace_id, wm.user_id, wm.role, w.name as workspace_name, u.email as user_email
FROM workspace_members wm
JOIN workspaces w ON wm.workspace_id = w.id
JOIN auth.users u ON wm.user_id = u.id;

SELECT '✅ Setup complete! Clear localStorage and refresh your app.' as info;
