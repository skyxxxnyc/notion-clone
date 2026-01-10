-- Create knowledge_bases table
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Create knowledge_sources table
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('document', 'video', 'audio', 'web', 'text')),
  url TEXT,
  file_size BIGINT,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  error TEXT
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_workspace ON knowledge_bases(workspace_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_created_by ON knowledge_bases(created_by);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_kb ON knowledge_sources(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_kb ON chat_messages(knowledge_base_id);

-- Enable RLS
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_bases
CREATE POLICY "Users can view knowledge bases in their workspaces"
  ON knowledge_bases FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create knowledge bases in their workspaces"
  ON knowledge_bases FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update knowledge bases in their workspaces"
  ON knowledge_bases FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete knowledge bases in their workspaces"
  ON knowledge_bases FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for knowledge_sources
CREATE POLICY "Users can view sources in their workspace knowledge bases"
  ON knowledge_sources FOR SELECT
  USING (
    knowledge_base_id IN (
      SELECT id FROM knowledge_bases
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create sources in their workspace knowledge bases"
  ON knowledge_sources FOR INSERT
  WITH CHECK (
    knowledge_base_id IN (
      SELECT id FROM knowledge_bases
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update sources in their workspace knowledge bases"
  ON knowledge_sources FOR UPDATE
  USING (
    knowledge_base_id IN (
      SELECT id FROM knowledge_bases
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete sources in their workspace knowledge bases"
  ON knowledge_sources FOR DELETE
  USING (
    knowledge_base_id IN (
      SELECT id FROM knowledge_bases
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for chat_messages
CREATE POLICY "Users can view chat messages in their workspace knowledge bases"
  ON chat_messages FOR SELECT
  USING (
    knowledge_base_id IN (
      SELECT id FROM knowledge_bases
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create chat messages in their workspace knowledge bases"
  ON chat_messages FOR INSERT
  WITH CHECK (
    knowledge_base_id IN (
      SELECT id FROM knowledge_bases
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for knowledge_bases
CREATE TRIGGER knowledge_bases_updated_at
  BEFORE UPDATE ON knowledge_bases
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_updated_at();
