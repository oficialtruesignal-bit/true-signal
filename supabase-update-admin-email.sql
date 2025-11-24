-- Update admin email and confirm it (FIXED VERSION)
-- Execute this in Supabase SQL Editor

-- 1. Update auth.users table - change email and confirm it
UPDATE auth.users
SET email = 'kwillianferreira@gmail.com',
    email_confirmed_at = NOW()
WHERE email = 'admin@tipster.com';

-- 2. Update the profile table to match
UPDATE profiles 
SET email = 'kwillianferreira@gmail.com'
WHERE email = 'admin@tipster.com';

-- 3. Verify the update
SELECT 
    u.email, 
    u.email_confirmed_at,
    p.role,
    p.first_name
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'kwillianferreira@gmail.com';
