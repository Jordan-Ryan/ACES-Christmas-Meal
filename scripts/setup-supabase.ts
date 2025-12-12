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
  console.error('Missing environment variables:');
  console.error('  SUPABASE_URL - Your Supabase project URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key');
  console.error('\nGet these from: Supabase Dashboard → Settings → API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTable() {
  console.log('Creating table: aces_christmas_meal...');
  
  // Create table using SQL
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS aces_christmas_meal (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      is_child BOOLEAN NOT NULL DEFAULT false,
      has_paid BOOLEAN DEFAULT false,
      order_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_aces_christmas_meal_id ON aces_christmas_meal(id);

    ALTER TABLE aces_christmas_meal ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow all operations on aces_christmas_meal" ON aces_christmas_meal;
    
    CREATE POLICY "Allow all operations on aces_christmas_meal"
      ON aces_christmas_meal
      FOR ALL
      USING (true)
      WITH CHECK (true);
  `;

  const { error: sqlError } = await supabase.rpc('exec_sql', { 
    sql: createTableSQL 
  }).catch(async () => {
    // If RPC doesn't work, try direct SQL execution via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql: createTableSQL }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to execute SQL: ${response.statusText}`);
    }
    return { error: null };
  });

  if (sqlError) {
    console.error('Error creating table:', sqlError);
    console.log('\n⚠️  Note: Direct SQL execution may not be available.');
    console.log('Please run the SQL manually in Supabase Dashboard → SQL Editor');
    console.log('SQL file: supabase_setup.sql');
    return false;
  }

  console.log('✅ Table created successfully!');
  return true;
}

async function insertInitialData() {
  console.log('\nLoading initial data from data.json...');
  
  const dataPath = join(__dirname, '..', 'server', 'data.json');
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
  
  console.log(`Found ${data.people.length} people to insert...`);
  
  // Transform data to match table structure
  const rows = data.people.map((person: any) => ({
    id: person.id,
    name: person.name,
    is_child: person.isChild,
    has_paid: person.hasPaid || false,
    order_data: person.order,
  }));

  // Upsert all people
  const { error } = await supabase
    .from('aces_christmas_meal')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Error inserting data:', error);
    return false;
  }

  console.log(`✅ Successfully inserted ${rows.length} people!`);
  return true;
}

async function main() {
  console.log('🚀 Setting up Supabase for ACES Christmas Meal...\n');
  
  const tableCreated = await setupTable();
  
  if (!tableCreated) {
    console.log('\n❌ Table creation failed. Please run SQL manually.');
    process.exit(1);
  }
  
  const dataInserted = await insertInitialData();
  
  if (!dataInserted) {
    console.log('\n⚠️  Data insertion failed. Table is created but empty.');
    console.log('You can insert data manually or try again.');
    process.exit(1);
  }
  
  console.log('\n🎉 Setup complete! Your Supabase database is ready.');
  console.log('\nNext steps:');
  console.log('1. Add environment variables to Vercel:');
  console.log('   - SUPABASE_URL');
  console.log('   - SUPABASE_ANON_KEY');
  console.log('2. Redeploy your Vercel project');
}

main().catch(console.error);

