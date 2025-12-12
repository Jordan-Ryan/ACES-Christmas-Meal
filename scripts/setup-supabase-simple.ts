import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('  SUPABASE_URL - Your Supabase project URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key');
  console.error('\nGet these from: Supabase Dashboard → Settings → API');
  console.error('\nThen run:');
  console.error('  export SUPABASE_URL="your-url"');
  console.error('  export SUPABASE_SERVICE_ROLE_KEY="your-key"');
  console.error('  npm run setup-supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertInitialData() {
  console.log('📊 Loading initial data from data.json...');
  
  const dataPath = join(__dirname, '..', 'server', 'data.json');
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
  
  console.log(`Found ${data.people.length} people to insert...\n`);
  
  // Transform data to match table structure
  const rows = data.people.map((person: any) => ({
    id: person.id,
    name: person.name,
    is_child: person.isChild,
    has_paid: person.hasPaid || false,
    order_data: person.order,
  }));

  // Upsert all people (this will create the table if it doesn't exist via PostgREST)
  // But first, let's check if table exists
  const { error: checkError } = await supabase
    .from('aces_christmas_meal')
    .select('id')
    .limit(1);

  if (checkError && checkError.code === '42P01') {
    console.error('❌ Table does not exist!');
    console.error('Please create the table first by running the SQL in supabase_setup.sql');
    console.error('Go to: Supabase Dashboard → SQL Editor → Run the SQL');
    process.exit(1);
  }

  console.log('✅ Table exists, inserting data...\n');

  // Upsert all people
  const { error, data: insertedData } = await supabase
    .from('aces_christmas_meal')
    .upsert(rows, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('❌ Error inserting data:', error);
    console.error('\nDetails:', error.message);
    return false;
  }

  console.log(`✅ Successfully inserted/updated ${insertedData?.length || rows.length} people!`);
  return true;
}

async function main() {
  console.log('🚀 Setting up Supabase data for ACES Christmas Meal...\n');
  
  const success = await insertInitialData();
  
  if (!success) {
    console.log('\n⚠️  Setup failed. Please check the errors above.');
    process.exit(1);
  }
  
  console.log('\n🎉 Setup complete! Your data is in Supabase.');
  console.log('\nNext steps:');
  console.log('1. Add environment variables to Vercel:');
  console.log('   - SUPABASE_URL');
  console.log('   - SUPABASE_ANON_KEY');
  console.log('2. Redeploy your Vercel project');
  console.log('3. Test by submitting an order!');
}

main().catch(console.error);


