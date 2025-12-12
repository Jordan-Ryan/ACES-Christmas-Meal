import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

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

// Helper function to read data file
function readData() {
  try {
    const data = readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { people: [] };
  }
}

// Helper function to write data file
function writeData(data: unknown) {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

// GET /api/menu - Get menu items
app.get('/api/menu', (req, res) => {
  res.json(menuData);
});

// GET /api/responses - Get all responses
app.get('/api/responses', (req, res) => {
  const data = readData();
  res.json(data);
});

// POST /api/responses - Submit or update a response
app.post('/api/responses', (req, res) => {
  const { personId, order, depositPaid, notes } = req.body;

  if (!personId || !order) {
    return res.status(400).json({ error: 'personId and order are required' });
  }

  const data = readData();
  const personIndex = data.people.findIndex((p: { id: number }) => p.id === personId);

  if (personIndex === -1) {
    return res.status(404).json({ error: 'Person not found' });
  }

  // Update the person's order and deposit status
  if (notes !== undefined && order) {
    order.notes = notes;
  }
  data.people[personIndex].order = order;
  if (depositPaid !== undefined) {
    data.people[personIndex].depositPaid = depositPaid;
  }

  if (writeData(data)) {
    res.json({ success: true, data });
  } else {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

