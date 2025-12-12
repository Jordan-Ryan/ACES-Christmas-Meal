# Check Environment Variables - IMPORTANT!

## The Issue:
If orders aren't saving, it's likely because the environment variables aren't set correctly.

## Step 1: Check Vercel Dashboard

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Look for these **EXACT** variable names:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

**If you DON'T see these variables:**
→ You need to add them manually (see Step 2)

**If you DO see them:**
→ Make sure they're enabled for **Production, Preview, AND Development**
→ Then redeploy

---

## Step 2: Get Credentials from Upstash

1. Go to: https://console.upstash.com/
2. Sign in (use the same account you used in Vercel Marketplace)
3. Click on your Redis database
4. Click the **"REST API"** tab
5. You'll see:
   - **UPSTASH_REDIS_REST_URL** (starts with `https://`)
   - **UPSTASH_REDIS_REST_TOKEN** (long token string)

---

## Step 3: Add to Vercel (If Missing)

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Click **"Add New"**
3. Add first variable:
   - **Key:** `UPSTASH_REDIS_REST_URL`
   - **Value:** (paste the URL from Upstash)
   - **Environment:** ✅ Production ✅ Preview ✅ Development
   - Click **"Save"**
4. Add second variable:
   - **Key:** `UPSTASH_REDIS_REST_TOKEN`
   - **Value:** (paste the token from Upstash)
   - **Environment:** ✅ Production ✅ Preview ✅ Development
   - Click **"Save"**

---

## Step 4: Redeploy

After adding/updating env vars:
- Vercel will usually auto-redeploy
- Or manually: **Deployments → Redeploy**

---

## Step 5: Test & Check Logs

1. Submit a test order
2. Go to: **Vercel Dashboard → Your Project → Functions → api/responses.ts → Logs**
3. Look for:
   - ✅ "Successfully saved data to Upstash Redis" = **WORKING!**
   - ❌ "Upstash Redis not configured" = **Env vars missing**
   - ❌ "Error writing data" = **Connection issue**

---

## Quick Test in Upstash Dashboard:

1. Go to: https://console.upstash.com/
2. Click your Redis database
3. Click **"Data Browser"** tab
4. Look for key: `christmas-meal-orders`
5. If you see it with your data = ✅ **Working!**
6. If empty = ❌ **Not saving** (check env vars)

---

## Still Not Working?

Check the function logs - they'll tell you exactly what's wrong:
- Missing env vars
- Wrong credentials
- Connection timeout
- etc.

