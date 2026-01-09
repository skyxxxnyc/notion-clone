-- ============================================
-- COMPREHENSIVE SCHEMA - Production Ready
-- Includes all tables, policies, indexes, triggers, and constraints
-- ============================================

-- Disable RLS temporarily to avoid conflicts during migration
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
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles CASCADE;
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces CASCADE;
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages CASCADE;
DROP TRIGGER IF EXISTS update_blocks_updated_at ON blocks CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop ALL tables
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (workspace_id, user_id),
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member', 'guest'))
);

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT DEFAULT 'Untitled' NOT NULL,
    icon TEXT,
    cover_image TEXT,
    cover_position INTEGER DEFAULT 50,
    parent_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    last_edited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    is_favourite BOOLEAN DEFAULT FALSE NOT NULL,
    is_template BOOLEAN DEFAULT FALSE NOT NULL,
    is_database BOOLEAN DEFAULT FALSE NOT NULL,
    database_config JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT,
    properties JSONB DEFAULT '{}' NOT NULL,
    "index" INTEGER DEFAULT 0 NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Workspace indexes
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);

-- Workspace members indexes
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);

-- Pages indexes
CREATE INDEX idx_pages_workspace_id ON pages(workspace_id);
CREATE INDEX idx_pages_parent_id ON pages(parent_id);
CREATE INDEX idx_pages_created_by ON pages(created_by);
CREATE INDEX idx_pages_last_edited_by ON pages(last_edited_by);
CREATE INDEX idx_pages_workspace_archived ON pages(workspace_id, is_archived);
CREATE INDEX idx_pages_workspace_favourite ON pages(workspace_id, is_favourite);

-- Blocks indexes
CREATE INDEX idx_blocks_page_id ON blocks(page_id);
CREATE INDEX idx_blocks_parent_id ON blocks(parent_id);
CREATE INDEX idx_blocks_created_by ON blocks(created_by);
CREATE INDEX idx_blocks_page_id_index ON blocks(page_id, "index");

-- Full-text search indexes
CREATE INDEX idx_pages_title_gin ON pages USING gin(to_tsvector('english', title));
CREATE INDEX idx_blocks_content_gin ON blocks USING gin(to_tsvector('english', coalesce(content, '')));

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES
-- ============================================

-- Profiles Policies
CREATE POLICY "profiles_select" ON profiles
    FOR SELECT
    USING (true);

CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Workspaces Policies
CREATE POLICY "workspaces_select" ON workspaces
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = workspaces.id
            AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "workspaces_insert" ON workspaces
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "workspaces_update" ON workspaces
    FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "workspaces_delete" ON workspaces
    FOR DELETE
    USING (owner_id = auth.uid());

-- Workspace Members Policies
CREATE POLICY "workspace_members_select" ON workspace_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = workspace_members.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "workspace_members_insert" ON workspace_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspaces
            WHERE workspaces.id = workspace_members.workspace_id
            AND workspaces.owner_id = auth.uid()
        )
    );

CREATE POLICY "workspace_members_update" ON workspace_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workspaces
            WHERE workspaces.id = workspace_members.workspace_id
            AND workspaces.owner_id = auth.uid()
        )
    );

CREATE POLICY "workspace_members_delete" ON workspace_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workspaces
            WHERE workspaces.id = workspace_members.workspace_id
            AND workspaces.owner_id = auth.uid()
        )
    );

-- Pages Policies
CREATE POLICY "pages_select" ON pages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "pages_insert" ON pages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "pages_update" ON pages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "pages_delete" ON pages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
            AND workspace_members.user_id = auth.uid()
        )
    );

-- Blocks Policies
CREATE POLICY "blocks_select" ON blocks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pages
            JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
            AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "blocks_insert" ON blocks
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM pages
            JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
            AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "blocks_update" ON blocks
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM pages
            JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
            AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "blocks_delete" ON blocks
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM pages
            JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
            AND workspace_members.user_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for automatic updated_at updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at
    BEFORE UPDATE ON blocks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SYNC EXISTING USERS
-- ============================================

INSERT INTO public.profiles (id, name, email, avatar_url)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', email),
    email,
    raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS FOR FULL-TEXT SEARCH
-- ============================================

-- Function to search pages and blocks
CREATE OR REPLACE FUNCTION search_content(
    search_query TEXT,
    workspace_id_filter UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    content TEXT,
    page_id UUID,
    workspace_id UUID,
    rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        'page'::TEXT as type,
        p.title,
        p.title as content,
        p.id as page_id,
        p.workspace_id,
        ts_rank(to_tsvector('english', p.title), plainto_tsquery('english', search_query)) as rank
    FROM pages p
    WHERE to_tsvector('english', p.title) @@ plainto_tsquery('english', search_query)
        AND (workspace_id_filter IS NULL OR p.workspace_id = workspace_id_filter)
        AND EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = p.workspace_id
            AND workspace_members.user_id = auth.uid()
        )

    UNION ALL

    SELECT
        b.id,
        'block'::TEXT as type,
        p.title,
        b.content,
        b.page_id,
        p.workspace_id,
        ts_rank(to_tsvector('english', coalesce(b.content, '')), plainto_tsquery('english', search_query)) as rank
    FROM blocks b
    JOIN pages p ON b.page_id = p.id
    WHERE to_tsvector('english', coalesce(b.content, '')) @@ plainto_tsquery('english', search_query)
        AND (workspace_id_filter IS NULL OR p.workspace_id = workspace_id_filter)
        AND EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = p.workspace_id
            AND workspace_members.user_id = auth.uid()
        )

    ORDER BY rank DESC
    LIMIT 50;
END;
$$;
