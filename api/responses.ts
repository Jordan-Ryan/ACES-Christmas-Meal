import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_KEY = 'christmas-meal-orders';

// Initialize Redis client (works with Upstash Redis)
function getRedisClient() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (redisUrl && redisToken) {
    return new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }
  return null;
}

// Read data from Upstash Redis or fallback to file
async function readData() {
  try {
    const redis = getRedisClient();
    
    // Try Upstash Redis first (for production)
    if (redis) {
      try {
        const data = await redis.get(DATA_KEY);
        if (data) {
          console.log('Read data from Upstash Redis');
          return data;
        }
        console.log('Upstash Redis key not found, will initialize from file');
      } catch (redisError) {
        console.error('Error reading from Upstash Redis:', redisError);
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
        // Initialize Redis with file data if available (first time only)
        if (redis) {
          try {
            await redis.set(DATA_KEY, parsed);
            console.log('Initialized Upstash Redis with file data');
          } catch (initError) {
            console.error('Error initializing Upstash Redis:', initError);
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

// Write data to Upstash Redis
async function writeData(data: any) {
  try {
    const redis = getRedisClient();
    
    if (redis) {
      await redis.set(DATA_KEY, data);
      console.log('Successfully saved data to Upstash Redis');
      return true;
    }
    // If Redis is not configured, return false (data won't persist)
    console.warn('Upstash Redis not configured - data will not persist');
    console.warn('Env vars check:', {
      hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return false;
  } catch (error) {
    console.error('Error writing data to Upstash Redis:', error);
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

