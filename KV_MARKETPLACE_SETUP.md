# Setting Up Vercel KV Through Marketplace (Upstash Redis)

Vercel has moved KV to the Marketplace via **Upstash Redis**. Here's how to set it up:

## Step-by-Step Instructions:

### 1. Go to Your Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your **ACES-Christmas-Meal** project

### 2. Access the Marketplace
- Look for **"Marketplace"** or **"Add-ons"** in the left sidebar or top menu
- Or click on the link that says "Learn more" next to the KV message
- Search for **"Upstash Redis"** in the Marketplace

### 3. Add Upstash Redis
- Click on **"Upstash Redis"** 
- Click **"Add Integration"** or **"Add to Project"**
- Sign in to Upstash (or create free account if needed)
- Choose a name for your database (e.g., `orders-kv`)
- Select a region (closest to you)
- Click **"Create"** or **"Add"**

**Note:** Upstash has a **FREE tier** with:
- 10,000 commands/day
- 256 MB storage
- Perfect for your project!

### 4. Environment Variables (Automatic)
- After adding Upstash Redis, Vercel will automatically add:
  - `KV_REST_API_URL` (or `UPSTASH_REDIS_REST_URL`)
  - `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_TOKEN`)
- These are automatically available to your serverless functions
- **No manual setup needed!**

**Note:** The code uses `@vercel/kv` which works with both KV and Upstash Redis automatically!

### 5. Redeploy
- After adding KV, Vercel will automatically redeploy
- Or manually trigger a deployment
- Wait for deployment to complete

### 6. Verify It Works
- The first API call will initialize KV with data from `data.json`
- All subsequent updates will persist in KV
- Check your Vercel function logs to confirm it's working

---

## Alternative: If You Can't Find Marketplace

If you don't see the Marketplace option, try:

1. **Check Your Plan**
   - Make sure you're on Hobby (free) or Pro plan
   - KV is available on both

2. **Direct Link**
   - Try: `https://vercel.com/[your-username]/[your-project]/storage`
   - Or: `https://vercel.com/[your-username]/[your-project]/marketplace`

3. **Project Settings**
   - Go to Project Settings → Storage
   - Or Project Settings → Integrations

4. **Contact Support**
   - If still can't find it, Vercel support can help
   - Or we can switch to Blob Storage (also free and works the same way)

---

## What Happens After Setup:

✅ Orders will save permanently  
✅ Everyone sees updates (auto-refresh every 5 seconds)  
✅ No more "Failed to save data" errors  
✅ All free on Hobby plan!  

---

## Need Help?

If you're still stuck, let me know and I can:
- Switch the code to use Blob Storage instead (also free, same setup)
- Help troubleshoot the Marketplace access
- Set up an alternative solution

