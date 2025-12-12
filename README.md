# ACES Christmas Meal Ordering App

A modern web application for managing Christmas meal orders. Built with React, TypeScript, and Express.

## Features

- 📝 **Order Form**: Easy-to-use form for selecting starters, mains, and desserts
- 👶 **Kids Menu Support**: Simplified ordering for children
- 📊 **Live View**: Real-time view of all orders with status indicators
- 🔄 **Auto-refresh**: Responses view automatically updates every 5 seconds
- 💾 **Simple Storage**: No database needed - uses JSON file storage

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Storage**: JSON file (no database required)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm run server
   ```
   The server will run on `http://localhost:3001`

3. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## Usage

1. **Place an Order:**
   - Click on "📝 Order Form" tab
   - Select a person from the dropdown
   - Choose your starter, main, and dessert (or kids menu option)
   - Click "Submit Order"

2. **View All Orders:**
   - Click on "📊 View Orders" tab
   - See all responses with status indicators
   - Orders automatically refresh every 5 seconds
   - Use the refresh button to manually update

## Project Structure

```
├── server/
│   ├── index.ts      # Express backend server
│   └── data.json     # JSON file storing all responses
├── src/
│   ├── components/
│   │   ├── OrderForm.tsx      # Order form component
│   │   └── ResponsesView.tsx  # Responses view component
│   ├── api.ts        # API client functions
│   ├── types.ts      # TypeScript type definitions
│   ├── App.tsx       # Main app component
│   ├── main.tsx      # React entry point
│   └── index.css     # Global styles
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## API Endpoints

- `GET /api/responses` - Get all current responses
- `POST /api/responses` - Submit or update an order
- `GET /api/menu` - Get menu items

## Data Format

The `server/data.json` file stores all people and their orders:

```json
{
  "people": [
    {
      "id": 1,
      "name": "Ruman",
      "isChild": false,
      "hasPaid": true,
      "order": {
        "starter": "Scotch egg",
        "main": "Roast loin of pork",
        "dessert": "Sticky toffee pudding"
      }
    }
  ]
}
```

## Development

- **Type checking**: `npm run type-check`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Notes

- The app uses a JSON file for storage, so all data persists between server restarts
- Multiple users can access the app simultaneously and see updates in real-time
- The responses view auto-refreshes every 5 seconds to show the latest orders
