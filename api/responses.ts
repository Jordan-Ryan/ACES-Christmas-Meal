import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read data file
function readData() {
  try {
    const dataPath = join(process.cwd(), 'server', 'data.json');
    const data = readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { people: [] };
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
    const data = readData();
    return res.json(data);
  }

  if (req.method === 'POST') {
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

    // Note: In Vercel serverless functions, file writes are ephemeral
    // For persistent storage, you'd need Vercel KV, a database, or another solution
    // For now, this will work but changes won't persist across deployments
    return res.json({ success: true, data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

