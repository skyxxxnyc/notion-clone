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
    -- owner, admin, member, guest
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
    parent_id UUID REFERENCES pages(id) ON DELETE
    SET NULL,
        workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
        created_by UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        last_edited_by UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
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
    -- For nested blocks
    type TEXT NOT NULL,
    content TEXT,
    properties JSONB DEFAULT '{}',
    index INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR
UPDATE USING (auth.uid() = id);
-- Workspaces Policies (Members can view workspaces they are part of)
CREATE POLICY "Users can view workspaces they are members of." ON workspaces FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM workspace_members
            WHERE workspace_members.workspace_id = workspaces.id
                AND workspace_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can create workspaces." ON workspaces FOR
INSERT WITH CHECK (true);
-- owner_id will be handled by trigger or app logic
-- Pages Policies
CREATE POLICY "Users can view pages in their workspaces." ON pages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
                AND workspace_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert pages in their workspaces." ON pages FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
                AND workspace_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update pages in their workspaces." ON pages FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM workspace_members
            WHERE workspace_members.workspace_id = pages.workspace_id
                AND workspace_members.user_id = auth.uid()
        )
    );
-- Blocks Policies
CREATE POLICY "Users can view blocks in their pages." ON blocks FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM pages
                JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
                AND workspace_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert blocks in their pages." ON blocks FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM pages
                JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
                AND workspace_members.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update blocks in their pages." ON blocks FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM pages
                JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
            WHERE pages.id = blocks.page_id
                AND workspace_members.user_id = auth.uid()
        )
    );
-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.profiles (id, name, email, avatar_url)
VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to handle user creation
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();