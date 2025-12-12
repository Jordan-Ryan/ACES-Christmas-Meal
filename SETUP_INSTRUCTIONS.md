# Setup Instructions - Make Updates Visible to Everyone

## The Problem
Right now, when someone submits an order, it's not persisting because Vercel serverless functions can't write to files. Updates disappear when the function restarts.

## The Solution: Vercel KV (Key-Value Storage)

Vercel KV is a database that will store all orders permanently. Once set up, everyone will see updates in real-time (the app auto-refreshes every 5 seconds).

---

## Step-by-Step Setup:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Sign in if needed
- Click on your **ACES-Christmas-Meal** project

### 2. Create KV Database
- Look for **"Storage"** tab in the top menu (or "Data" tab)
- Click **"Create Database"** button
- Select **"KV"** (Key-Value store)
- Name it: `orders-kv` (or any name you like)
- Choose a region (closest to you)
- Click **"Create"**

### 3. Environment Variables (Automatic)
- Vercel will **automatically** add these environment variables:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
- These are automatically available to your serverless functions
- **You don't need to do anything** - Vercel handles this!

### 4. Redeploy
- After creating KV, Vercel will automatically redeploy
- Or manually trigger a deployment by pushing to GitHub
- Wait for deployment to complete

### 5. Initialize Data (First Time Only)
- The first time the API runs, it will read from `data.json` and save it to KV
- After that, all updates will be stored in KV permanently

---

## How It Works After Setup:

✅ **Submitting Orders**: Saves to Vercel KV (permanent storage)  
✅ **Viewing Orders**: Reads from Vercel KV (always up-to-date)  
✅ **Auto-Refresh**: The "View Orders" page refreshes every 5 seconds automatically  
✅ **Everyone Sees Updates**: All users see the same data from KV  

---

## Troubleshooting:

### Can't find "Storage" tab?
- You might need to upgrade your Vercel plan
- Free tier includes KV, but check if you're on the right plan
- Alternative: Contact me and I can set up a different storage solution

### Still seeing "Failed to save data"?
- Make sure KV database is created
- Check that deployment completed successfully
- Wait a few minutes after creating KV for it to be fully available

### Updates not showing?
- The app auto-refreshes every 5 seconds
- You can manually refresh the page
- Check browser console for any errors

---

## Current Status:
- ✅ Code is ready for KV
- ✅ Auto-refresh is enabled (5 seconds)
- ⏳ **YOU NEED TO**: Create KV database in Vercel dashboard

Once KV is set up, everything will work perfectly!

