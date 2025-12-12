import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { DrinkItem } from '../../../src/types';

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
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Drink ID is required' });
  }

  // PUT /api/drinks/:id - Update a drink
  if (req.method === 'PUT') {
    try {
      const { name, price } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({ error: 'name and price are required' });
      }

      const { data, error } = await supabase
        .from(DRINKS_TABLE)
        .update({
          name: name.trim(),
          price: parseFloat(price),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating drink:', error);
        return res.status(500).json({ error: 'Failed to update drink' });
      }

      return res.json(data);
    } catch (error) {
      console.error('Error updating drink:', error);
      return res.status(500).json({ error: 'Failed to update drink' });
    }
  }

  // DELETE /api/drinks/:id - Delete a drink
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from(DRINKS_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting drink:', error);
        return res.status(500).json({ error: 'Failed to delete drink' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting drink:', error);
      return res.status(500).json({ error: 'Failed to delete drink' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

