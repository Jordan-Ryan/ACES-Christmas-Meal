import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import type { Person, ResponsesData } from '../src/types';

const app = express();
const PORT = 3001;
const TABLE_NAME = 'aces_christmas_meal';

app.use(cors());
app.use(express.json());

// Initialize Supabase client
function getSupabaseClient() {
  // Support both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Support both ANON_KEY and SERVICE_ROLE_KEY
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase not configured - missing env vars');
    console.warn('   Need: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
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
      extras: row.extras || [],
    }));
    
    console.log(`✅ Read ${people.length} people from Supabase`);
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
    
    console.log(`✅ Successfully saved ${rows.length} people to Supabase`);
    return true;
  } catch (error) {
    console.error('Error writing data to Supabase:', error);
    return false;
  }
}

// Menu data organized by category - Sunday Menu with prices
const menuData = {
  snacks: [
    { name: 'Sourdough, crisp bread, salted butter', price: 4.50 },
    { name: 'Whitebait', price: 8.50 },
    { name: 'Scotch egg', price: 7.50 },
    { name: 'Cod cheeks, curry sauce', price: 9.50 },
    { name: 'Rock oysters', price: 3.50 },
  ],
  starters: [
    { name: 'Roast celeriac soup, woodland mushroom toastie', price: 9.50 },
    { name: 'Beetroots, pickled pear, horseradish curds, hazelnuts', price: 10.50 },
    { name: 'Baked camembert for two', price: 16.00 },
    { name: 'Chicken livers on toast', price: 10.50 },
    { name: 'Pork, pistachio and cranberry terrine, Waldorf slaw', price: 11.50 },
    { name: 'Chopped beef, horseradish', price: 11.50 },
    { name: 'Mackerel rillette, rye crumpet, pickles', price: 10.50 },
    { name: 'Monkfish scampi, gribiche', price: 12.50 },
  ],
  sundayRoasts: [
    { name: 'Roast sirloin of native breed beef, horseradish', price: 24.50 },
    { name: 'Roast loin of pork, apple sauce, crackling', price: 22.50 },
    { name: 'Grain fed chicken, bread sauce', price: 21.50 },
    { name: 'O\'Brien\'s nut roast, mushroom gravy', price: 20.50 },
  ],
  mains: [
    { name: 'Caramelised cauliflower risotto, smoked almonds, \'feta\'', price: 19.50 },
    { name: 'Chestnut and leek homity pie, greens, smoked cheddar sauce', price: 18.50 },
    { name: 'Sea trout, mussels, fennel, sea herbs', price: 24.50 },
    { name: 'Plaice, samphire, brown butter', price: 22.50 },
    { name: 'Chicken, leek and tarragon pie for two', price: 38.00 },
  ],
  sides: [
    { name: 'Sprout tops, bacon and chestnuts', price: 5.50 },
    { name: 'Honey roast parsnips', price: 5.00 },
    { name: 'Garlic and parmesan mash', price: 5.50 },
    { name: 'Pub chips', price: 5.00 },
    { name: 'Butterhead lettuce, shallots, lemon', price: 5.00 },
  ],
  desserts: [
    { name: 'Clementine and ginger cheesecake, pistachio', price: 9.50 },
    { name: 'Sticky toffee pudding, clotted cream', price: 9.50 },
    { name: 'Chocolate mousse, salted caramel, honeycomb', price: 9.50 },
    { name: 'Quickes Mature Cheddar, Eccles cake', price: 9.50 },
    { name: 'Apple tarte tatin for two, ice cream, custard', price: 16.00 },
  ],
  kidsMains: [
    { name: 'Fish fingers, chips, peas', price: 8.50 },
    { name: 'Grilled chicken fillets, chips, peas', price: 9.50 },
    { name: 'Sausages, mashed potatoes, peas', price: 8.50 },
    { name: 'Rigatoni pasta, pesto, Parmesan', price: 8.50 },
    { name: 'Cheeseburger, chips, salad', price: 9.50 },
  ],
  kidsRoasts: [
    { name: 'Roast sirloin of native breed beef, horseradish', price: 14.50 },
    { name: 'Roast loin of pork, apple sauce, crackling', price: 13.50 },
    { name: 'Grain fed chicken, bread sauce', price: 12.50 },
    { name: 'O\'Brien\'s nut roast, mushroom gravy', price: 12.50 },
  ],
  kidsDesserts: [
    { name: 'Chocolate brownie, ice cream', price: 5.50 },
    { name: 'Sticky toffee pudding', price: 5.50 },
    { name: 'Ice cream (1 scoop)', price: 3.50 },
    { name: 'Ice cream (2 scoops)', price: 5.00 },
    { name: 'Ice cream (3 scoops)', price: 6.50 },
  ],
};


// GET /api/menu - Get menu items
app.get('/api/menu', (_req, res) => {
  res.json(menuData);
});

// GET /api/responses - Get all responses
app.get('/api/responses', async (_req, res) => {
  const data = await readData();
  res.json(data);
});

// POST /api/responses - Submit or update a response
app.post('/api/responses', async (req, res) => {
  const { personId, order, depositPaid, hasPaid, notes, extras } = req.body;

  if (!personId || !order) {
    return res.status(400).json({ error: 'personId and order are required' });
  }

  const data = await readData();
  const personIndex = data.people.findIndex((p) => p.id === personId);

  if (personIndex === -1) {
    return res.status(404).json({ error: 'Person not found' });
  }

  // Update the person's order and payment status
  // Support both 'depositPaid' and 'hasPaid' for backward compatibility
  const paymentStatus = hasPaid !== undefined ? hasPaid : depositPaid;
  
  if (notes !== undefined && order) {
    order.notes = notes;
  }
  data.people[personIndex].order = order;
  if (paymentStatus !== undefined) {
    data.people[personIndex].hasPaid = paymentStatus;
  }
  if (extras !== undefined) {
    data.people[personIndex].extras = extras;
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

  console.log('✅ Order saved successfully to Supabase!');
  return res.json({ success: true, data });
});

// Drinks management - stored in Supabase as JSONB
const DRINKS_TABLE = 'drinks_items';

// GET /api/drinks - Get all drinks
app.get('/api/drinks', async (_req, res) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.json([]);
    }

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
});

// POST /api/drinks - Add a new drink
app.post('/api/drinks', async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' });
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
});

// PUT /api/drinks/:id - Update a drink
app.put('/api/drinks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' });
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
});

// DELETE /api/drinks/:id - Delete a drink
app.delete('/api/drinks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

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
});

// PUT /api/responses/:personId/extras - Update person's extras
app.put('/api/responses/:personId/extras', async (req, res) => {
  try {
    const personId = parseInt(req.params.personId);
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
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  const supabase = getSupabaseClient();
  if (supabase) {
    console.log('✅ Supabase configured - data will be stored in Supabase');
    console.log(`   Using: ${process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  } else {
    console.log('⚠️  Supabase not configured - check your .env file');
    console.log('   Need: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
  }
});
