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

// Menu data organized by category - Sunday Menu
const menuData = {
  snacks: [
    'Sourdough, crisp bread, salted butter',
    'Whitebait',
    'Scotch egg',
    'Cod cheeks, curry sauce',
    'Rock oysters',
  ],
  starters: [
    'Roast celeriac soup, woodland mushroom toastie',
    'Beetroots, pickled pear, horseradish curds, hazelnuts',
    'Baked camembert for two',
    'Chicken livers on toast',
    'Pork, pistachio and cranberry terrine, Waldorf slaw',
    'Chopped beef, horseradish',
    'Mackerel rillette, rye crumpet, pickles',
    'Monkfish scampi, gribiche',
  ],
  sundayRoasts: [
    'Roast sirloin of native breed beef, horseradish',
    'Roast loin of pork, apple sauce, crackling',
    'Grain fed chicken, bread sauce',
    'O\'Brien\'s nut roast, mushroom gravy',
  ],
  mains: [
    'Caramelised cauliflower risotto, smoked almonds, \'feta\'',
    'Chestnut and leek homity pie, greens, smoked cheddar sauce',
    'Sea trout, mussels, fennel, sea herbs',
    'Plaice, samphire, brown butter',
    'Chicken, leek and tarragon pie for two',
  ],
  sides: [
    'Sprout tops, bacon and chestnuts',
    'Honey roast parsnips',
    'Garlic and parmesan mash',
    'Pub chips',
    'Butterhead lettuce, shallots, lemon',
  ],
  desserts: [
    'Clementine and ginger cheesecake, pistachio',
    'Sticky toffee pudding, clotted cream',
    'Chocolate mousse, salted caramel, honeycomb',
    'Quickes Mature Cheddar, Eccles cake',
    'Apple tarte tatin for two, ice cream, custard',
  ],
  kidsMenu: [
    'Fish fingers, chips, peas',
    'Grilled chicken fillets, chips, peas',
    'Sausages, mashed potatoes, peas',
    'Rigatoni pasta, pesto, Parmesan',
    'Cheeseburger, chips, salad',
    'Chocolate brownie, ice cream',
    'Sticky toffee pudding',
    'Ice cream (1 scoop)',
    'Ice cream (2 scoops)',
    'Ice cream (3 scoops)',
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
  const { personId, order, depositPaid, hasPaid, notes } = req.body;

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

