const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.*)/);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseAnonKey = keyMatch[1].trim();
} catch (err) {
  console.error('Error reading .env.local:', err.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanDemos() {
  console.log('Cleaning up all demo profiles, walks, and dogs from database...');
  
  // 1. Delete bookings for demo walkers
  const { error: bookingsError } = await supabase
    .from('bookings')
    .delete()
    .or('walker_id.in.(sarah-mitchell,elena-rodriguez,david-chen),walker_name.in.("Sarah Mitchell","Elena Rodriguez","David Chen")');
  
  if (bookingsError) {
    console.error('Error deleting demo bookings:', bookingsError);
  } else {
    console.log('Demo bookings cleaned successfully.');
  }

  // 2. Delete demo walkers
  const { error: walkersError } = await supabase
    .from('walkers')
    .delete()
    .in('id', ['sarah-mitchell', 'elena-rodriguez', 'david-chen']);

  if (walkersError) {
    console.error('Error deleting demo walkers:', walkersError);
  } else {
    console.log('Demo walkers cleaned successfully.');
  }

  // 3. Delete demo dog
  const { error: dogsError } = await supabase
    .from('dogs')
    .delete()
    .eq('name', 'Max')
    .eq('breed', 'Golden Retriever');

  if (dogsError) {
    console.error('Error deleting demo dog:', dogsError);
  } else {
    console.log('Demo dogs cleaned successfully.');
  }

  console.log('Database cleanup completed!');
}

cleanDemos();
