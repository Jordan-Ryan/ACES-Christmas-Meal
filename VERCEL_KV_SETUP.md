# Vercel KV Setup Instructions

To enable persistent storage for orders on Vercel, you need to set up Vercel KV.

## Steps:

1. **Go to your Vercel Dashboard**
   - Navigate to your project: https://vercel.com/dashboard
   - Select your "ACES-Christmas-Meal" project

2. **Create a KV Database**
   - Go to the "Storage" tab in your project
   - Click "Create Database"
   - Select "KV" (Key-Value)
   - Choose a name (e.g., "orders-kv")
   - Select a region close to you
   - Click "Create"

3. **Get Environment Variables**
   - After creating the KV database, Vercel will automatically add these environment variables:
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
   - These should be automatically available to your serverless functions

4. **Verify Setup**
   - After deployment, the API will automatically use Vercel KV for storage
   - The first time it runs, it will initialize KV with data from `data.json`
   - All subsequent updates will persist in KV

## Testing Locally (Optional)

If you want to test KV locally, you can add these to a `.env.local` file:
```
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
```

**Note:** The code will fallback to reading from `data.json` if KV is not configured, but writes won't persist without KV.

