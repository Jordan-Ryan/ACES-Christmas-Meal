# Verify Upstash Redis Connection

## Check if Environment Variables Are Set

### Step 1: Check Vercel Dashboard
1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Look for these variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - OR `KV_REST_API_URL`
   - OR `KV_REST_API_TOKEN`

**If you don't see ANY of these:**
- The integration might not have added them automatically
- You need to add them manually from Upstash dashboard

### Step 2: Get Credentials from Upstash
1. Go to: https://console.upstash.com/
2. Sign in with the same account you used in Vercel Marketplace
3. Click on your Redis database
4. Go to **"REST API"** tab
5. Copy:
   - **UPSTASH_REDIS_REST_URL** (the URL)
   - **UPSTASH_REDIS_REST_TOKEN** (the token)

### Step 3: Add to Vercel Manually
1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Click **"Add New"**
3. Add:
   - **Key:** `UPSTASH_REDIS_REST_URL`
   - **Value:** (paste the URL from Upstash)
   - **Environment:** Production, Preview, Development (select all)
4. Click **"Save"**
5. Repeat for:
   - **Key:** `UPSTASH_REDIS_REST_TOKEN`
   - **Value:** (paste the token from Upstash)

### Step 4: Redeploy
- After adding env vars, Vercel will auto-redeploy
- Or manually trigger: Deployments → Redeploy

---

## Test Connection

After redeploy, check the function logs:
1. Go to: **Vercel Dashboard → Your Project → Functions → api/responses.ts**
2. Look for logs when you submit an order:
   - ✅ "Successfully saved data to KV/Upstash" = Working!
   - ❌ "Vercel KV/Upstash Redis not configured" = Env vars missing
   - ❌ "Error writing data to KV/Upstash" = Connection issue

---

## Common Issues:

### Issue 1: No Environment Variables
**Solution:** Add them manually from Upstash dashboard (see Step 2-3 above)

### Issue 2: Wrong Variable Names
**Solution:** The code supports both:
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (Upstash)
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` (Vercel KV)

Make sure at least one set is present!

### Issue 3: Database Not Connected
**Solution:** If you created the database in Upstash but didn't connect it to Vercel:
- Go to Upstash dashboard
- Check if the database shows "Connected to Vercel"
- If not, you may need to reconnect it through Marketplace

---

## Quick Test:

Try submitting an order, then immediately check:
1. **Upstash Dashboard** → Your Database → Data Browser
2. Look for key: `christmas-meal-orders`
3. If you see it with your data = ✅ Working!
4. If empty = ❌ Not saving (check env vars)

