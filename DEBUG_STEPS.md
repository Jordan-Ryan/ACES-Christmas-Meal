# Debug Steps - Orders Not Saving

## Step 1: Check Function Logs

1. Go to: **Vercel Dashboard → Your Project → Functions → api/responses.ts**
2. Click **"Logs"** tab
3. Try submitting an order
4. Look for these log messages:

### ✅ Good Signs:
- "Attempting to save data to Upstash Redis..."
- "Successfully saved data to Upstash Redis"
- "Verified: Data exists in Redis"
- "Order saved successfully!"

### ❌ Bad Signs:
- "Upstash Redis not configured"
- "Env vars check: { hasUrl: false, hasToken: false }"
- "Error writing data to Upstash Redis"
- Any error messages

---

## Step 2: Check Environment Variables

1. Go to: **Vercel Dashboard → Settings → Environment Variables**
2. Verify these exist:
   - `UPSTASH_REDIS_REST_URL` (should start with `https://`)
   - `UPSTASH_REDIS_REST_TOKEN` (long string)
3. Make sure they're enabled for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

**If missing:**
- Go to Upstash Console → Your Database → REST API tab
- Copy the URL and Token
- Add them manually to Vercel

---

## Step 3: Verify Upstash Connection

1. Go to: https://console.upstash.com/
2. Click your Redis database
3. Check:
   - Is it connected to your Vercel project?
   - Does it show as "Active"?
   - Check the "Data Browser" - is there a key `christmas-meal-orders`?

---

## Step 4: Test Directly in Upstash

1. Go to Upstash Console → Your Database → Data Browser
2. Try manually adding a test key:
   - Key: `test-key`
   - Value: `{"test": "data"}`
3. If this works, Redis is fine - issue is in the code
4. If this fails, Redis connection might be the problem

---

## Step 5: Check Deployment

1. Go to: **Vercel Dashboard → Deployments**
2. Make sure the latest deployment completed successfully
3. Check the build logs for any errors
4. If there are errors, redeploy

---

## Common Issues:

### Issue 1: Env Vars Not Set
**Solution:** Add them manually from Upstash dashboard

### Issue 2: Env Vars Not Enabled for All Environments
**Solution:** Make sure Production, Preview, AND Development are checked

### Issue 3: Wrong Package
**Solution:** We're using `@upstash/redis` - make sure it's installed (it is)

### Issue 4: Redis Not Connected to Vercel
**Solution:** In Upstash, click "Connect to Project" and select your Vercel project

### Issue 5: Deployment Not Updated
**Solution:** Manually trigger a redeploy after adding env vars

---

## What to Share:

If it's still not working, share:
1. What you see in the function logs (copy/paste)
2. Whether env vars are present
3. Any error messages
4. What happens when you submit an order (does it show success but not save?)

---

## Quick Test:

After checking logs, try:
1. Submit an order
2. Immediately check Upstash Data Browser
3. Look for key `christmas-meal-orders`
4. If it's there with your data = ✅ Working!
5. If it's empty or missing = ❌ Not saving

