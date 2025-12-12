import type { VercelRequest, VercelResponse } from '@vercel/node';

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

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.json(menuData);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

