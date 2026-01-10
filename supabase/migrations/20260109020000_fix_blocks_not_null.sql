-- Fix blocks.page_id to be NOT NULL
-- This prevents the 23502 error (not null constraint violation)

-- First, delete any orphaned blocks that somehow have null page_id
DELETE FROM blocks WHERE page_id IS NULL;

-- Now add the NOT NULL constraint
ALTER TABLE blocks
ALTER COLUMN page_id SET NOT NULL;
