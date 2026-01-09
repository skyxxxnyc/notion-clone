-- Check what columns actually exist in your tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'workspaces', 'workspace_members', 'pages', 'blocks')
ORDER BY table_name, ordinal_position;
