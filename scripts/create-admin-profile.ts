import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAdminProfile() {
  console.log('🔍 Checking for existing profile...\n');
  
  // First, let's check if we can access Supabase Auth users
  console.log('Attempting to list auth users...');
  
  // Try to insert a profile directly for the email we know
  const email = 'kwillianferreira@gmail.com';
  
  // We need to get the user ID from Supabase Auth
  // Since we don't have service role key, we'll use the anon key and work with what we have
  
  console.log(`🔄 Creating profile for ${email}...\n`);
  
  // Generate a UUID for the profile (this should match the Supabase Auth user ID)
  // But since we don't have access to auth.users, we'll create a profile with a known ID
  
  // Let's try a different approach: Create the profile with the ID from the auth session
  // First, sign in to get the user ID
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email,
    password: 'Isabella7D!',
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    console.log('\n💡 This is expected if you haven\'t registered this user in Supabase yet.');
    console.log('   Please sign up first through the app, then run this script again.');
    process.exit(1);
  }

  if (!authData.user) {
    console.error('❌ No user data returned');
    process.exit(1);
  }

  console.log('✅ Authentication successful!');
  console.log(`   User ID: ${authData.user.id}`);
  console.log(`   Email: ${authData.user.email}\n`);

  // Now create or update the profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id,
      email: authData.user.email,
      first_name: authData.user.user_metadata?.first_name || 'Admin',
      role: 'admin',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (profileError) {
    console.error('❌ Error creating profile:', profileError);
    process.exit(1);
  }

  console.log('✅ Profile created/updated successfully!');
  console.log('📊 Profile data:', profileData);
  console.log('\n🎉 Done! The user now has admin role in Supabase.');
  console.log('   Please refresh the app to see the changes.');

  process.exit(0);
}

createAdminProfile();
