# Fix: Environment Variables Missing

## The Problem:
You're seeing: "Data saved in memory but will not persist"
This means the environment variables aren't being found.

---

## Solution: Add Environment Variables Manually

Even though you connected Upstash to Vercel, the env vars might not have been added automatically.

### Step 1: Get Credentials from Upstash

1. Go to: https://console.upstash.com/
2. Sign in
3. Click on your Redis database
4. Click the **"REST API"** tab
5. You'll see two values:
   - **UPSTASH_REDIS_REST_URL** (starts with `https://`)
   - **UPSTASH_REDIS_REST_TOKEN** (long token string)
6. **Copy both values**

### Step 2: Add to Vercel

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Click **"Add New"** button
3. Add the first variable:
   - **Key:** `UPSTASH_REDIS_REST_URL`
   - **Value:** (paste the URL you copied from Upstash)
   - **Environment:** Check ALL boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **"Save"**
4. Click **"Add New"** again
5. Add the second variable:
   - **Key:** `UPSTASH_REDIS_REST_TOKEN`
   - **Value:** (paste the token you copied from Upstash)
   - **Environment:** Check ALL boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **"Save"**

### Step 3: Redeploy

1. Go to: **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or wait for auto-redeploy (usually happens automatically)
4. Wait 1-2 minutes for deployment to complete

### Step 4: Test

1. Submit an order
2. Check function logs: **Functions → api/responses.ts → Logs**
3. You should now see: "Successfully saved data to Upstash Redis"
4. No more warning message!

---

## Verify It Worked:

### Check Logs:
After redeploy, when you submit an order, you should see:
```
Redis env vars check: {
  UPSTASH_REDIS_REST_URL: true,
  UPSTASH_REDIS_REST_TOKEN: true,
  foundUrl: true,
  foundToken: true
}
Attempting to save data to Upstash Redis...
Successfully saved data to Upstash Redis
Verified: Data exists in Redis
Order saved successfully!
```

### Check Upstash:
1. Go to Upstash Console → Your Database → Data Browser
2. Look for key: `christmas-meal-orders`
3. If you see it with your data = ✅ **Working!**

---

## Why This Happens:

Sometimes when you connect Upstash to Vercel through the Marketplace, the environment variables don't get added automatically. This is a known issue. Adding them manually always works!

---

## Still Not Working?

If you've added the env vars and redeployed but still see the warning:
1. Double-check the variable names are EXACTLY:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
2. Make sure they're enabled for ALL environments
3. Check the function logs - they'll show which env vars are found
4. Share the log output with me

