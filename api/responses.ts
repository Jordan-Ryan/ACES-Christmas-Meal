import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, createClient } from '@vercel/kv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_KEY = 'christmas-meal-orders';

// Initialize KV client with explicit env vars (works with both KV and Upstash)
function getKvClient() {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (kvUrl && kvToken) {
    return createClient({
      url: kvUrl,
      token: kvToken,
    });
  }
  return null;
}

// Read data from Vercel KV/Upstash Redis or fallback to file
async function readData() {
  try {
    const kvClient = getKvClient();
    
    // Try Vercel KV/Upstash Redis first (for production)
    if (kvClient) {
      try {
        const data = await kvClient.get(DATA_KEY);
        if (data) {
          console.log('Read data from KV/Upstash');
          return data;
        }
        console.log('KV/Upstash key not found, will initialize from file');
      } catch (kvError) {
        console.error('Error reading from KV/Upstash:', kvError);
        // Fall through to file system
      }
    }
    
    // Fallback to file system (for local development or initial setup)
    const possiblePaths = [
      join(__dirname, 'data.json'),
      join(process.cwd(), 'api', 'data.json'),
      join(process.cwd(), 'server', 'data.json'),
    ];
    
    for (const dataPath of possiblePaths) {
      try {
        const data = readFileSync(dataPath, 'utf-8');
        const parsed = JSON.parse(data);
        // Initialize KV with file data if KV/Upstash is available (first time only)
        if (kvClient) {
          try {
            await kvClient.set(DATA_KEY, parsed);
            console.log('Initialized KV/Upstash with file data');
          } catch (initError) {
            console.error('Error initializing KV/Upstash:', initError);
          }
        }
        return parsed;
      } catch (err) {
        continue;
      }
    }
    
    return { people: [] };
  } catch (error) {
    console.error('Error reading data:', error);
    return { people: [] };
  }
}

// Write data to Vercel KV/Upstash Redis
async function writeData(data: any) {
  try {
    const kvClient = getKvClient();
    
    if (kvClient) {
      await kvClient.set(DATA_KEY, data);
      console.log('Successfully saved data to KV/Upstash');
      return true;
    }
    // If KV/Upstash is not configured, return false (data won't persist)
    console.warn('Vercel KV/Upstash Redis not configured - data will not persist');
    return false;
  } catch (error) {
    console.error('Error writing data to KV/Upstash:', error);
    return false;
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
    const data = await readData();
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { personId, order, hasPaid, notes } = req.body;

    if (!personId || !order) {
      return res.status(400).json({ error: 'personId and order are required' });
    }

    const data = await readData();
    const personIndex = data.people.findIndex((p: { id: number }) => p.id === personId);

    if (personIndex === -1) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Update the person's order and payment status
    if (notes !== undefined && order) {
      order.notes = notes;
    }
    data.people[personIndex].order = order;
    if (hasPaid !== undefined) {
      data.people[personIndex].hasPaid = hasPaid;
    }

    // Save to Vercel KV for persistence
    const saved = await writeData(data);
    
    if (!saved) {
      // Still return success, but warn that data won't persist
      // This allows the app to work even without KV configured
      console.warn('Vercel KV not configured - data changes will not persist');
      return res.json({ 
        success: true, 
        data,
        warning: 'Data saved in memory but will not persist. Please configure Vercel KV for persistent storage.'
      });
    }

    return res.json({ success: true, data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

