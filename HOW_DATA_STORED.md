# How Data is Stored in Upstash Redis

## Redis is a Key-Value Store (Not Tables)

Upstash Redis doesn't use tables like a traditional database. Instead, it stores data as **key-value pairs**.

---

## How Your Data is Stored:

### Single Key, All Data:
- **Key:** `christmas-meal-orders`
- **Value:** Your entire JSON data (all 17 people + their orders)

### Example Structure:
```
Key: "christmas-meal-orders"
Value: {
  "people": [
    {
      "id": 1,
      "name": "Ruman",
      "isChild": false,
      "hasPaid": true,
      "order": { ... }
    },
    {
      "id": 2,
      "name": "Amy",
      ...
    },
    ... (all 17 people)
  ]
}
```

---

## How It Works:

1. **When you submit an order:**
   - Code reads the entire `people` array from Redis
   - Updates the specific person's order
   - Saves the entire `people` array back to Redis

2. **When you view orders:**
   - Code reads the entire `people` array from Redis
   - Displays all orders

---

## View Your Data in Upstash:

1. Go to: https://console.upstash.com/
2. Click your Redis database
3. Click **"Data Browser"** tab
4. You'll see:
   - **Key:** `christmas-meal-orders`
   - **Value:** Your JSON data (click to expand and view)

---

## Why This Approach?

✅ **Simple** - One key, all data  
✅ **Fast** - Single read/write operation  
✅ **Perfect for small datasets** - Your 17 people fit easily  
✅ **No complex queries needed** - Just get/set the whole thing  

---

## Data Size:

- Your current data: ~8-10 KB
- Redis free tier: 256 MB
- **You're using <0.01% of available space!** 🎉

---

## Important Notes:

- **Not a table** - It's a single JSON object stored under one key
- **All or nothing** - We read/write the entire dataset each time
- **Perfect for your use case** - Small dataset, simple operations
- **Auto-refresh** - The app refreshes every 5 seconds to show updates

---

## If You Need Tables Later:

If your data grows significantly, you could:
- Store each person as a separate key: `person:1`, `person:2`, etc.
- Use Redis Lists or Hashes for more structure
- But for now, the single key approach is perfect!

---

## Summary:

✅ Data is stored as JSON under key `christmas-meal-orders`  
✅ Not in tables - it's a key-value store  
✅ You can view it in Upstash Data Browser  
✅ All 17 people's orders are in one JSON object  
✅ Perfect for your use case!  

