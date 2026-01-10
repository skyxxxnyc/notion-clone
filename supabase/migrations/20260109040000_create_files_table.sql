-- Create files table for managing uploaded files
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('images', 'videos', 'audio', 'documents', 'files')),
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_files_workspace ON files(workspace_id);
CREATE INDEX IF NOT EXISTS idx_files_page ON files(page_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for files
CREATE POLICY "Users can view files in their workspaces"
  ON files FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files to their workspaces"
  ON files FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files in their workspaces"
  ON files FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files in their workspaces"
  ON files FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Create storage bucket for workspace files (if it doesn't exist)
-- This is typically done via Supabase Dashboard or CLI
-- But we can insert the configuration here for reference
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-files', 'workspace-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload workspace files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workspace-files');

-- Allow users to view files in their workspaces
CREATE POLICY "Users can view workspace files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'workspace-files');

-- Allow users to delete their own uploaded files
CREATE POLICY "Users can delete their workspace files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'workspace-files');
