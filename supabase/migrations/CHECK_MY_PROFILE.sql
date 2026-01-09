-- Check if I have a profile
SELECT
    CASE
        WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED'
        WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) THEN 'PROFILE EXISTS'
        ELSE 'PROFILE MISSING'
    END as status;

-- Show my profile if it exists
SELECT * FROM profiles WHERE id = auth.uid();

-- Show my user info from auth
SELECT id, email FROM auth.users WHERE id = auth.uid();
