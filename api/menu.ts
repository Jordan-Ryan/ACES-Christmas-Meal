import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { MenuData } from '../src/types';

// Menu data organized by category - Sunday Menu with prices
const menuData: MenuData = {
  snacks: [
    { name: 'Sourdough, crisp bread, salted butter', price: 4.5 },
    { name: 'Whitebait', price: 6.5 },
    { name: 'Scotch egg', price: 7 },
    { name: 'Cod cheeks, curry sauce', price: 8.5 },
    { name: 'Rock oysters', price: 3.5 },
  ],
  starters: [
    { name: 'Spiced parsnip soup, \'nduja\' arancini (pb)', price: 9 },
    { name: 'Artichokes, goat\'s curd, hazelnuts', price: 10.5 },
    { name: 'Chicken livers on toast', price: 9.5 },
    { name: 'Country terrine, Waldorf slaw', price: 9 },
    { name: 'Mackerel crumpet, pickles', price: 9 },
    { name: 'Monkfish scampi, gribiche', price: 9.5 },
  ],
  sundayRoasts: [
    { name: 'Roast sirloin of native breed beef, horseradish', price: 26 },
    { name: 'Roast loin of pork, apple sauce, crackling', price: 21.5 },
    { name: 'Grain fed chicken, bread sauce', price: 23 },
    { name: 'O\'Brien\'s nut roast, mushroom gravy', price: 19.5 },
  ],
  mains: [
    { name: 'Roast squash risotto, sage, \'ricotta\' (pb)', price: 18.5 },
    { name: 'Roast pollock, kedgeree', price: 27.5 },
    { name: 'Plaice, samphire, brown butter', price: 29 },
    { name: 'Chicken, leek and tarragon pie for two', price: 48 },
  ],
  sides: [
    { name: 'Buttered greens', price: 5 },
    { name: 'Carrots and peas, chervil butter', price: 5 },
    { name: 'Garlic and parmesan mash', price: 5 },
    { name: 'Pub chips', price: 5 },
    { name: 'Butterhead lettuce, shallots, lemon', price: 5 },
  ],
  desserts: [
    { name: 'Vanilla cheesecake, cherries, pistachio (pb)', price: 9 },
    { name: 'Sticky toffee pudding, clotted cream', price: 9 },
    { name: 'Brown sugar set custard, blackberries, almond crumble', price: 9 },
    { name: 'Chocolate mousse, salted caramel, honeycomb', price: 9 },
    { name: 'Quickes Mature Cheddar, Eccles cake', price: 11.5 },
    { name: 'Apple tarte tatin for two, ice cream, custard', price: 17 },
  ],
  kidsMains: [
    { name: 'Fish & chips', price: 8.5 },
    { name: 'Chicken goujons', price: 9.5 },
    { name: 'Mac & cheese', price: 8.5 },
  ],
  kidsRoasts: [
    { name: 'Roast sirloin of native breed beef, horseradish', price: 12.5 },
    { name: 'Roast loin of pork, apple sauce, crackling', price: 14.5 },
    { name: 'Grain fed chicken, bread sauce', price: 13.5 },
    { name: 'O\'Brien\'s nut roast, mushroom gravy', price: 12.5 },
  ],
  kidsDesserts: [
    { name: 'Vanilla cheesecake, cherries, pistachio (pb)', price: 3.5 },
    { name: 'Sticky toffee pudding, clotted cream', price: 3.5 },
    { name: 'Brown sugar set custard, blackberries, almond crumble', price: 3.5 },
    { name: 'Chocolate mousse, salted caramel, honeycomb', price: 6.5 },
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

