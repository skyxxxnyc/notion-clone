-- ============================================
-- SIMPLE DATABASE CONNECTION TEST
-- Run this first to verify Supabase is working
-- ============================================

-- Test 1: Can we see auth users?
SELECT 'Test 1: Auth users visible: ' || COUNT(*)::text as result FROM auth.users;

-- Test 2: Check what public tables exist
SELECT 'Test 2: Public tables: ' || string_agg(tablename, ', ') as result
FROM pg_tables
WHERE schemaname = 'public';

-- Test 3: Current user ID
SELECT 'Test 3: Current user ID: ' || COALESCE(auth.uid()::text, 'NOT AUTHENTICATED') as result;

-- Test 4: Try to create a simple test table
DROP TABLE IF EXISTS test_table CASCADE;
CREATE TABLE test_table (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), test TEXT);
INSERT INTO test_table (test) VALUES ('Database is working!');
SELECT 'Test 4: ' || test as result FROM test_table;
DROP TABLE test_table;

-- If you see all 4 test results above, your database is working fine.
-- The problem is just missing/incorrect tables.
-- Run FINAL_FIX.sql next.
