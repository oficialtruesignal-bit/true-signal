import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateAdminRole() {
  console.log('🔄 Updating admin role in Supabase...');
  
  // Update the role for the admin user
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', 'kwillianferreira@gmail.com')
    .select();

  if (error) {
    console.error('❌ Error updating role:', error);
    process.exit(1);
  }

  console.log('✅ Role updated successfully!');
  console.log('📊 Updated profile:', data);
  
  // Verify the update
  const { data: verifyData, error: verifyError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'kwillianferreira@gmail.com')
    .single();

  if (verifyError) {
    console.error('❌ Error verifying update:', verifyError);
  } else {
    console.log('✅ Verification:');
    console.log('  Email:', verifyData.email);
    console.log('  Name:', verifyData.first_name);
    console.log('  Role:', verifyData.role);
  }

  process.exit(0);
}

updateAdminRole();
