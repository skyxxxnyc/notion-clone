-- Check workspace_members columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'workspace_members'
ORDER BY ordinal_position;
