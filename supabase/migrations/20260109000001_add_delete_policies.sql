-- Add DELETE policies for workspaces
CREATE POLICY "Users can delete workspaces they own." ON workspaces FOR DELETE USING (
    owner_id = auth.uid()
);

-- Add DELETE policies for workspace_members
CREATE POLICY "Workspace owners can manage members." ON workspace_members FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM workspaces
        WHERE workspaces.id = workspace_members.workspace_id
            AND workspaces.owner_id = auth.uid()
    )
);

CREATE POLICY "Workspace owners can add members." ON workspace_members FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1
        FROM workspaces
        WHERE workspaces.id = workspace_members.workspace_id
            AND workspaces.owner_id = auth.uid()
    )
);

-- Add DELETE policy for pages
CREATE POLICY "Users can delete pages in their workspaces." ON pages FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM workspace_members
        WHERE workspace_members.workspace_id = pages.workspace_id
            AND workspace_members.user_id = auth.uid()
    )
);

-- Add DELETE policy for blocks
CREATE POLICY "Users can delete blocks in their pages." ON blocks FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM pages
            JOIN workspace_members ON pages.workspace_id = workspace_members.workspace_id
        WHERE pages.id = blocks.page_id
            AND workspace_members.user_id = auth.uid()
    )
);

-- Add UPDATE policy for workspaces (missing from original migration)
CREATE POLICY "Workspace owners can update their workspaces." ON workspaces FOR UPDATE USING (
    owner_id = auth.uid()
);
