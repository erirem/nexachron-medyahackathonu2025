// Quick test to check if users table exists
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://tfqnfkyntjreanffixti.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcW5ma3ludGpyZWFuZmZpeHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjczODAsImV4cCI6MjA3Mzk0MzM4MH0.GHyet9orem6sYpOb-suaFPcYRfOVYohZRLfRzGTgxLk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testUsersTable() {
  console.log('🔍 Testing users table...');
  
  try {
    // Try to select from users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Users table error:', error.message);
      console.log('   Hint: Run the SQL setup in Supabase Dashboard');
    } else {
      console.log('✅ Users table exists!');
      console.log('📊 Data:', data);
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }
}

testUsersTable();