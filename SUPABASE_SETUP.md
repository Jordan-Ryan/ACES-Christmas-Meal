# Supabase Setup Guide

## Step 1: Create the Table in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (in the left sidebar)
4. Click **"New Query"**
5. Copy and paste the SQL from `supabase_setup.sql`
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see "Success" message

The table `aces_christmas_meal` will be created with:
- `id` (integer, primary key)
- `name` (text)
- `is_child` (boolean)
- `has_paid` (boolean)
- `order_data` (JSONB - stores the order object)
- `created_at` and `updated_at` (timestamps)

---

## Step 2: Get Your Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

---

## Step 3: Add Environment Variables to Vercel

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Click **"Add New"**
3. Add first variable:
   - **Key:** `SUPABASE_URL`
   - **Value:** (paste your Project URL)
   - **Environment:** ✅ Production ✅ Preview ✅ Development
   - Click **"Save"**
4. Click **"Add New"** again
5. Add second variable:
   - **Key:** `SUPABASE_ANON_KEY`
   - **Value:** (paste your anon/public key)
   - **Environment:** ✅ Production ✅ Preview ✅ Development
   - Click **"Save"**

---

## Step 4: Initialize Data (Optional)

If you want to import your existing data from `data.json`:

1. The first time someone submits an order, it will create the person in Supabase
2. Or you can manually insert data through Supabase Dashboard → Table Editor
3. Or I can create a migration script if needed

---

## Step 5: Redeploy

1. Go to: **Vercel Dashboard → Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Wait 1-2 minutes for deployment to complete

---

## Step 6: Test

1. Submit an order
2. Check Supabase Dashboard → Table Editor → `aces_christmas_meal`
3. You should see your data!
4. Check function logs: **Functions → api/responses.ts → Logs**
5. Should see: "Successfully saved X people to Supabase"

---

## Troubleshooting:

### Table doesn't exist?
- Make sure you ran the SQL script
- Check Supabase Dashboard → Table Editor

### "Supabase not configured" error?
- Check environment variables are set correctly
- Make sure they're enabled for all environments
- Redeploy after adding env vars

### Data not saving?
- Check function logs for errors
- Verify RLS (Row Level Security) policies allow writes
- Check Supabase Dashboard → Logs for any errors

---

## Benefits of Supabase:

✅ **Free tier** - 500 MB database, 2 GB bandwidth  
✅ **Real-time** - Can add real-time subscriptions later  
✅ **SQL** - Full SQL database (PostgreSQL)  
✅ **Dashboard** - Easy to view/edit data  
✅ **MCP Support** - You mentioned having MCP access  

---

## Next Steps:

Once it's working, you can:
- View data in Supabase Dashboard → Table Editor
- Query data using SQL
- Add real-time subscriptions if needed
- Export data easily


