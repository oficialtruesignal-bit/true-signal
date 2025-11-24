-- Update admin email and confirm it
-- Execute this in Supabase SQL Editor

-- 1. Update the profile table
UPDATE profiles 
SET email = 'kwillianferreira@gmail.com'
WHERE role = 'admin';

-- 2. Update auth.users table (requires admin access)
-- This confirms the email automatically
UPDATE auth.users
SET email = 'kwillianferreira@gmail.com',
    email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'admin@tipster.com';

-- 3. Verify the update
SELECT email, email_confirmed_at, role 
FROM auth.users 
JOIN profiles ON auth.users.id = profiles.id
WHERE email = 'kwillianferreira@gmail.com';
