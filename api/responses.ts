import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Person, ResponsesData } from '../src/types';

const TABLE_NAME = 'aces_christmas_meal';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured - missing env vars');
    console.warn('Need: SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Read all people from Supabase
async function readData(): Promise<ResponsesData> {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      console.warn('Supabase not configured, returning empty data');
      return { people: [] };
    }
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error reading from Supabase:', error);
      return { people: [] };
    }
    
    if (!data || data.length === 0) {
      console.log('No data in Supabase, returning empty');
      return { people: [] };
    }
    
    // Transform Supabase rows to Person format
    const people: Person[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      isChild: row.is_child,
      hasPaid: row.has_paid || false,
      order: row.order_data,
    }));
    
    console.log(`Read ${people.length} people from Supabase`);
    return { people };
  } catch (error) {
    console.error('Error reading data:', error);
    return { people: [] };
  }
}

// Write/update all people to Supabase
async function writeData(data: ResponsesData): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      console.warn('Supabase not configured - data will not persist');
      return false;
    }
    
    // Upsert all people (insert or update)
    const rows = data.people.map((person) => ({
      id: person.id,
      name: person.name,
      is_child: person.isChild,
      has_paid: person.hasPaid || false,
      order_data: person.order,
      updated_at: new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(rows, { onConflict: 'id' });
    
    if (error) {
      console.error('Error writing to Supabase:', error);
      return false;
    }
    
    console.log(`Successfully saved ${rows.length} people to Supabase`);
    return true;
  } catch (error) {
    console.error('Error writing data to Supabase:', error);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const data = await readData();
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { personId, order, hasPaid, notes } = req.body;

    if (!personId || !order) {
      return res.status(400).json({ error: 'personId and order are required' });
    }

    // Read current data
    const data = await readData();
    const personIndex = data.people.findIndex((p) => p.id === personId);

    if (personIndex === -1) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Update the person's order and payment status
    if (notes !== undefined && order) {
      order.notes = notes;
    }
    data.people[personIndex].order = order;
    if (hasPaid !== undefined) {
      data.people[personIndex].hasPaid = hasPaid;
    }

    // Save to Supabase
    const saved = await writeData(data);
    
    if (!saved) {
      console.warn('Failed to save to Supabase');
      return res.json({ 
        success: true, 
        data,
        warning: 'Data saved in memory but will not persist. Please configure Supabase.'
      });
    }

    console.log('Order saved successfully to Supabase!');
    return res.json({ success: true, data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
