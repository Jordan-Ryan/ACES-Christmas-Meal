import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { ResponsesData, ExtraItem } from '../../../src/types';

const TABLE_NAME = 'aces_christmas_meal';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured - missing env vars');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Read all people from Supabase
async function readData(): Promise<ResponsesData> {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
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
      return { people: [] };
    }
    
    // Transform Supabase rows to Person format
    const people = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      isChild: row.is_child,
      hasPaid: row.has_paid || false,
      order: row.order_data,
      extras: row.extras || [],
    }));
    
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
      return false;
    }
    
    // Upsert all people (insert or update)
    const rows = data.people.map((person) => ({
      id: person.id,
      name: person.name,
      is_child: person.isChild,
      has_paid: person.hasPaid || false,
      order_data: person.order,
      extras: person.extras || [],
      updated_at: new Date().toISOString(),
    }));
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(rows, { onConflict: 'id' });
    
    if (error) {
      console.error('Error writing to Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error writing data to Supabase:', error);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'PUT') {
    try {
      const personId = parseInt(req.query.personId as string);
      const { extras } = req.body;

      if (!personId || extras === undefined) {
        return res.status(400).json({ error: 'personId and extras are required' });
      }

      const data = await readData();
      const personIndex = data.people.findIndex((p) => p.id === personId);

      if (personIndex === -1) {
        return res.status(404).json({ error: 'Person not found' });
      }

      data.people[personIndex].extras = extras;

      const saved = await writeData(data);
      
      if (!saved) {
        return res.status(500).json({ error: 'Failed to save extras' });
      }

      return res.json({ success: true, data });
    } catch (error) {
      console.error('Error updating extras:', error);
      return res.status(500).json({ error: 'Failed to update extras' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

