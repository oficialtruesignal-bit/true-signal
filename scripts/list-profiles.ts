import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listProfiles() {
  console.log('📋 Listing all profiles in Supabase...\n');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching profiles:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('⚠️ No profiles found in Supabase database');
    process.exit(0);
  }

  console.log(`✅ Found ${data.length} profile(s):\n`);
  
  data.forEach((profile, index) => {
    console.log(`Profile #${index + 1}:`);
    console.log(`  ID: ${profile.id}`);
    console.log(`  Email: ${profile.email}`);
    console.log(`  Name: ${profile.first_name}`);
    console.log(`  Role: ${profile.role}`);
    console.log(`  Created: ${profile.created_at}`);
    console.log('');
  });

  process.exit(0);
}

listProfiles();
