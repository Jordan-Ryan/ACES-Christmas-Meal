import type { VercelRequest, VercelResponse } from '@vercel/node';

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

