// Test Supabase connection independently
const { createClient } = require('@supabase/supabase-js');

// Test with your credentials
const SUPABASE_URL = 'https://tfqnfkyntjreanffixti.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcW5ma3ludGpyZWFuZmZpeHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjczODAsImV4cCI6MjA3Mzk0MzM4MH0.GHyet9orem6sYpOb-suaFPcYRfOVYohZRLfRzGTgxLk';

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  try {
    const { data, error } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);
    
    console.log('✅ Connection successful!');
    console.log('Data:', data);
    console.log('Error:', error);
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    
    // Try ping
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`);
      console.log('Ping response status:', response.status);
    } catch (pingErr) {
      console.log('❌ Ping failed:', pingErr.message);
    }
  }
}

test();