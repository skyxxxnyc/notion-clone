-- ============================================
-- FINAL FIX - Nuclear Option
-- This will completely destroy and rebuild everything
-- ============================================

-- Disable RLS temporarily to avoid conflicts
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blocks DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on ALL tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE',
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop ALL tables
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- CREATE TABLES FROM SCRATCH
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT DEFAULT 'Untitled',
    icon TEXT,
    cover_image TEXT,
    cover_position INTEGER DEFAULT 50,
    parent_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    last_edited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    is_favourite BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    is_database BOOLEAN DEFAULT FALSE,
    database_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    parent_id UUID,
    type TEXT NOT NULL,
    content TEXT,
    properties JSONB DEFAULT '{}',
    index INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES
-- ============================================

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Workspaces
CREATE POLICY "workspaces_select" ON workspaces FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "workspaces_insert" ON workspaces FOR INSERT WITH CHECK (true);
CREATE POLICY "workspaces_update" ON workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "workspaces_delete" ON workspaces FOR DELETE USING (owner_id = auth.uid());

-- Workspace Members
CREATE POLICY "workspace_members_select" ON workspace_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM workspace_members wm
        WHERE wm.workspace_id = workspace_members.workspace_id
        AND wm.user_id = auth.uid()
    )
);

CREATE POLICY "workspace_members_insert" ON workspace_members FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspaces
        WHERE workspaces.id = workspace_members.workspace_id
        AND workspaces.owner_id = auth.uid()
    )
);

CREATE POLICY "workspace_members_delete" ON workspace_members FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM workspaces
        WHERE workspaces.id = workspace_members.workspace_id
        AND workspaces.owner_id = auth.uid()
    )
);

-- Pages
CREATE POLICY "pages_select" ON pages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = pages.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "pages_insert" ON pages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = pages.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "pages_update" ON pages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = pages.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "pages_delete" ON pages FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = pages.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
);

-- Blocks
CREATE POLICY "blocks_select" ON blocks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM pages
        JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
        WHERE pages.id = blocks.page_id
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "blocks_insert" ON blocks FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM pages
        JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
        WHERE pages.id = blocks.page_id
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "blocks_update" ON blocks FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM pages
        JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
        WHERE pages.id = blocks.page_id
        AND workspace_members.user_id = auth.uid()
    )
);

CREATE POLICY "blocks_delete" ON blocks FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM pages
        JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
        WHERE pages.id = blocks.page_id
        AND workspace_members.user_id = auth.uid()
    )
);

-- ============================================
-- TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SYNC USERS
-- ============================================

INSERT INTO public.profiles (id, name, email, avatar_url)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', email),
    email,
    raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
