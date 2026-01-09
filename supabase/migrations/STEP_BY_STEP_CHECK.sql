-- ============================================
-- STEP BY STEP CHECK
-- This checks one thing at a time to avoid errors
-- ============================================

-- Step 1: Check what tables exist
SELECT 'Step 1: Checking tables...' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
