# ACES Christmas Meal Ordering App

A modern web application for managing Christmas meal orders. Built with React, TypeScript, Express, and Supabase.

## Features

- 📝 **Order Form**: Easy-to-use form for selecting starters, mains, and desserts
- 👶 **Kids Menu Support**: Simplified ordering for children
- 📊 **View Orders**: See all orders with status indicators
- ✏️ **Edit Orders**: Click on any completed order to edit it
- 💾 **Persistent Storage**: All data stored in Supabase PostgreSQL database
- 📤 **Export to Excel**: Export all orders to Excel spreadsheet

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase PostgreSQL database

## Setup

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Environment variables configured

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a Supabase project at https://supabase.com
   - Run the SQL from `supabase_setup.sql` in Supabase SQL Editor
   - Get your Supabase credentials from Settings → API

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   # OR use service role key for server-side operations
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Start the backend server:**
   ```bash
   npm run server
   ```
   The server will run on `http://localhost:3001`

5. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## Usage

1. **Place an Order:**
   - Click on "Order Form" tab
   - Select a person from the dropdown
   - Choose your starter, main, and dessert (or kids menu option)
   - Click "Submit Order"

2. **View All Orders:**
   - Click on "View Orders" tab
   - See all responses with status indicators
   - Click on any completed order to edit it
   - Use the refresh button to manually update
   - Export to Excel using the "Export to Excel" button

3. **Edit an Order:**
   - Go to "View Orders" tab
   - Click on any person's name (with a completed order)
   - The order form will open with their current selections
   - Make changes and submit

## Project Structure

```
├── server/
│   └── index.ts      # Express backend server (uses Supabase)
├── api/
│   ├── menu.ts       # Vercel serverless function for menu
│   └── responses.ts  # Vercel serverless function for responses (uses Supabase)
├── src/
│   ├── components/
│   │   ├── OrderForm.tsx      # Order form component
│   │   └── ResponsesView.tsx # Responses view component
│   ├── api.ts        # API client functions
│   ├── types.ts      # TypeScript type definitions
│   ├── App.tsx       # Main app component
│   ├── main.tsx      # React entry point
│   └── index.css     # Global styles
├── supabase_setup.sql  # SQL script to create Supabase table
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## API Endpoints

- `GET /api/responses` - Get all current responses (from Supabase)
- `POST /api/responses` - Submit or update an order (saves to Supabase)
- `GET /api/menu` - Get menu items

## Database Schema

The app uses a Supabase PostgreSQL table `aces_christmas_meal` with the following structure:

- `id` (INTEGER PRIMARY KEY) - Person ID
- `name` (TEXT) - Person's name
- `is_child` (BOOLEAN) - Whether person is a child
- `has_paid` (BOOLEAN) - Whether deposit has been paid
- `order_data` (JSONB) - Order details (starter, main, dessert, etc.)
- `created_at` (TIMESTAMP) - When record was created
- `updated_at` (TIMESTAMP) - When record was last updated

## Development

- **Type checking**: `npm run type-check`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Setup Supabase data**: `npm run setup-supabase`

## Deployment

### Vercel Deployment

The app is configured for Vercel deployment:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`)
4. Deploy

The `api/` directory contains Vercel serverless functions that use Supabase for data storage.

## Notes

- All data is stored in Supabase PostgreSQL database
- Data persists across deployments and server restarts
- Multiple users can access the app simultaneously
- Orders can be edited by clicking on the person's name in the View Orders tab
