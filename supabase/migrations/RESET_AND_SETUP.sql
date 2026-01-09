-- ============================================
-- COMPLETE DATABASE RESET AND SETUP
-- Run this in Supabase SQL Editor
-- This will DROP everything and recreate fresh
-- ============================================

-- 1. DROP ALL EXISTING POLICIES
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname
              FROM pg_policies
              WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 2. DROP ALL TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. DROP ALL FUNCTIONS
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 4. DROP ALL TABLES (in correct order to handle dependencies)
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- RECREATE EVERYTHING FROM SCRATCH
-- ============================================

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspaces table
CREATE TABLE workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspace members junction table
CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- Create pages table
CREATE TABLE pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create blocks table
CREATE TABLE blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE ALL POLICIES
-- ============================================

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Workspaces Policies
CREATE POLICY "Users can view workspaces they are members of."
    ON workspaces FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = workspaces.id
                AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create workspaces."
    ON workspaces FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Workspace owners can update their workspaces."
    ON workspaces FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Users can delete workspaces they own."
    ON workspaces FOR DELETE
    USING (owner_id = auth.uid());

-- Workspace Members Policies
CREATE POLICY "Workspace owners can add members."
    ON workspace_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspaces
            WHERE workspaces.id = workspace_members.workspace_id
                AND workspaces.owner_id = auth.uid()
        )
    );

CREATE POLICY "Workspace owners can manage members."
    ON workspace_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workspaces
            WHERE workspaces.id = workspace_members.workspace_id
                AND workspaces.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can view workspace members."
    ON workspace_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = workspace_members.workspace_id
                AND wm.user_id = auth.uid()
        )
    );

-- Pages Policies
CREATE POLICY "Users can view pages in their workspaces."
    ON pages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
                AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert pages in their workspaces."
    ON pages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
                AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update pages in their workspaces."
    ON pages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
                AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete pages in their workspaces."
    ON pages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
                AND workspace_members.user_id = auth.uid()
        )
    );

-- Blocks Policies
CREATE POLICY "Users can view blocks in their pages."
    ON blocks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pages
            JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
                AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert blocks in their pages."
    ON blocks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM pages
            JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
                AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update blocks in their pages."
    ON blocks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM pages
            JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
                AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete blocks in their pages."
    ON blocks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM pages
            JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
                AND workspace_members.user_id = auth.uid()
        )
    );

-- ============================================
-- CREATE TRIGGER FUNCTION AND TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();

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
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
