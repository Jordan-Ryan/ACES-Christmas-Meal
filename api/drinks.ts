import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { DrinkItem } from '../src/types';

const DRINKS_TABLE = 'drinks_items';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  // GET /api/drinks - Get all drinks
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from(DRINKS_TABLE)
        .select('*')
        .order('name');

      if (error) {
        console.error('Error reading drinks:', error);
        return res.json([]);
      }

      return res.json(data || []);
    } catch (error) {
      console.error('Error fetching drinks:', error);
      return res.json([]);
    }
  }

  // POST /api/drinks - Add a new drink
  if (req.method === 'POST') {
    try {
      const { name, price } = req.body;
      if (!name || price === undefined) {
        return res.status(400).json({ error: 'name and price are required' });
      }

      const newDrink = {
        id: `drink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        price: parseFloat(price),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(DRINKS_TABLE)
        .insert([newDrink])
        .select()
        .single();

      if (error) {
        console.error('Error adding drink:', error);
        return res.status(500).json({ error: 'Failed to add drink' });
      }

      return res.json(data);
    } catch (error) {
      console.error('Error adding drink:', error);
      return res.status(500).json({ error: 'Failed to add drink' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

