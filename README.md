# ACES Christmas Meal

Web app for recording Sunday lunch orders for a fixed list of people. The page title and header are **ACES Christmas Meal**. The View Orders heading is **Sunday Lunch Pre-Order**.

The interface is a React single-page app. Tabs in `src/App.tsx`:

| Tab | Component | What it does |
| --- | --- | --- |
| Order Form | `src/components/OrderForm.tsx` | Loads the menu from `GET /api/menu` and submits one person's order with `POST /api/responses`. |
| View Orders | `src/components/ResponsesView.tsx` | Lists people returned by `GET /api/responses`, shows prices from the menu, and can export an `.xlsx` file in the browser. |
| Manage Extras | `src/components/ManageDrinks.tsx` | Adds, edits, and deletes rows in the `drinks_items` table through `/api/drinks`. |
| Drinks & Extras | `src/components/DrinksExtras.tsx` | Sets per-person quantities with `PUT /api/responses/:personId/extras`. |
| Receipt | `src/components/Receipt.tsx` | Sums menu items and extras. Service charge starts at `12.5` in component state and is edited in the browser. |
| To Be Paid | `src/components/ToBePaid.tsx` | Same food and extras sums. For each adult, subtracts `15` with a floor of `0`, then applies the service-charge percent to that remainder. The percent starts at `12.5` in component state. |

Menu item names and prices are hardcoded in `server/index.ts` and `api/menu.ts`. Categories: `snacks`, `starters`, `sundayRoasts`, `mains`, `sides`, `desserts`, `kidsMains`, `kidsRoasts`, `kidsDesserts`.

## Stack

From `package.json`:

- React 18 and Vite for the client
- Express for the local API (`server/index.ts`, started with `tsx`)
- Vercel Node functions under `api/` for the same routes
- `@supabase/supabase-js` for `aces_christmas_meal` and `drinks_items`
- `xlsx` for the View Orders spreadsheet export
- `dotenv` loaded by `server/index.ts` via `import 'dotenv/config'`

`package.json` does not set `engines`. The lockfile records `vite@5.4.21` (`node: ^18.0.0 || >=20.0.0`) and `tsx@4.21.0` (`node: >=18.0.0`).

## Run locally

Install dependencies:

```bash
npm install
```

Create a `.env` file in the repo root. `server/index.ts` reads:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

The local server listens on port `3001`. `vite.config.ts` serves the client on port `5173` and proxies `/api` to `http://localhost:3001`. Start both:

```bash
npm run server
```

```bash
npm run dev
```

Open `http://localhost:5173`.

`POST /api/responses` updates an existing person id. If that id is missing, the handler responds with `404` and `{ "error": "Person not found" }`. `npm run setup-supabase` upserts the 17 people in `server/data.json`. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the table SQL and the script's environment variables.

## Scripts

| Script | Command | What it runs |
| --- | --- | --- |
| `dev` | `npm run dev` | `vite` |
| `server` | `npm run server` | `tsx watch server/index.ts` |
| `build` | `npm run build` | `tsc && vite build` |
| `preview` | `npm run preview` | `vite preview` |
| `type-check` | `npm run type-check` | `tsc --noEmit` |
| `setup-supabase` | `npm run setup-supabase` | `tsx scripts/setup-supabase.ts` |

`tsconfig.json` sets `"noEmit": true` and includes `src` and `server`. `npm run build` typechecks those projects, then Vite writes `dist`. `vite.config.ts` sets `server.port` to `5173` and does not set a preview port. `tsconfig.json` has no `references` entry for `tsconfig.node.json`, and it does not include `api/`.

`npm run setup-supabase` does not import `dotenv`. The script reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the process environment. It upserts `server/data.json` only after its `exec_sql` call reports success. `scripts/setup-supabase-simple.ts` only upserts that file and is not wired to a `package.json` script. The exact RPC behavior is in [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## Using the tabs

**Order Form.** The person dropdown lists people whose order has neither `main` nor `sundayRoast`, unless a person was opened for editing. Adults can set a snack or starter (stored on `order.starter`; a snack wins if both are selected), a Sunday roast or a main (a roast wins and `main` is omitted), sides, dessert, notes, and the **Paid (Deposit)** checkbox (`hasPaid`). Children can set a kids main or kids roast (a roast wins), dessert, and notes. Submit requires a main or a Sunday roast. After a successful submit the app switches to View Orders.

**View Orders.** A completed order is one with `main` or `sundayRoast`. Clicking that person's name opens Order Form with their current values. Pending names are not clickable. **Refresh** calls `GET /api/responses` again. **Export to Excel** downloads `ACES-Christmas-Meal-Orders-<YYYY-MM-DD>.xlsx`. Every row has `#`, Name, Is Child, Notes, and Status. Adult rows also have Starter, Sunday Roast, Main, Sides, Dessert, and Total Price. Child rows also have Kids Main and Kids Dessert.

**Manage Extras.** Creates drinks-style extras with a name and price. Ids are generated in the API as ``drink_${Date.now()}_${random}``.

**Drinks & Extras.** Pick a person and change quantities. Each extra is `{ drinkId, quantity }` on `person.extras`.

**Receipt.** People whose food-plus-extras total is `0` are omitted. Each listed person shows menu lines, extras, a subtotal, a service-charge line on that subtotal, and a total. The page then shows a subtotal, service charge, and grand total across those people. The percent stays in component state.

**To Be Paid.** Lists people whose food-plus-extras subtotal is above `0`. For each adult the breakdown subtracts `15`, floors the remainder at `0`, and labels the subtraction **Deposit Paid**. Children use `0`. Service charge for that person is the percent of the floored remainder. The grand total is the sum of those per-person totals. The selected-totals service-charge line is `(sum of subtotals − 15 × number of selected adults) × percent / 100`, without the per-person floor. The screen does not read `hasPaid` when it subtracts `15`. Selection stays in component state.

`hasPaid` is stored as `has_paid` and shown as a **Paid** badge on View Orders.

## HTTP routes

The browser calls relative `/api` paths (`src/api.ts`). The same paths exist in `server/index.ts` and under `api/`.

| Method and path | Role |
| --- | --- |
| `GET /api/menu` | Returns the hardcoded menu. |
| `GET /api/responses` | Reads `aces_christmas_meal` ordered by `id`. |
| `POST /api/responses` | Updates one existing person: `personId`, `order`, optional `hasPaid`, `notes`, `extras`. |
| `GET /api/drinks` | Lists `drinks_items` ordered by `name`. |
| `POST /api/drinks` | Inserts `{ name, price }`. |
| `PUT /api/drinks/:id` | Updates `name` and `price`. |
| `DELETE /api/drinks/:id` | Deletes that id. |
| `PUT /api/responses/:personId/extras` | Replaces that person's `extras` array. |

Local Express also accepts `depositPaid` on `POST /api/responses` when `hasPaid` is omitted (`server/index.ts`). The Vercel handler in `api/responses.ts` reads `hasPaid` only. The Order Form sends `hasPaid`.

Vercel handlers read `SUPABASE_URL` and `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`. They do not read `NEXT_PUBLIC_SUPABASE_URL`.

If the local server has no Supabase client, `GET /api/responses` returns `{ "people": [] }` and `GET /api/drinks` returns `[]`. The Vercel drinks handler returns `500` with `{ "error": "Supabase not configured" }` when those variables are missing.

## Database objects the handlers use

`aces_christmas_meal` rows are mapped as:

| Column written by the handlers | App field |
| --- | --- |
| `id` | `Person.id` |
| `name` | `Person.name` |
| `is_child` | `Person.isChild` |
| `has_paid` | `Person.hasPaid` |
| `order_data` | `Person.order` |
| `extras` | `Person.extras` (default `[]`) |
| `updated_at` | set on upsert |

`supabase_setup.sql` creates `aces_christmas_meal` with `id`, `name`, `is_child`, `has_paid`, `order_data`, `created_at`, and `updated_at`. It enables row level security and adds the policy `Allow all operations on aces_christmas_meal` for all operations with `USING (true)` and `WITH CHECK (true)`. The file does not add `extras`.

`drinks_items` is read and written by the drinks routes. Fields the handlers set: `id`, `name`, `price`, `created_at` on insert, `updated_at` on update. No `CREATE TABLE` for `drinks_items` is in this repo.

## Layout

```
api/menu.ts                              Vercel menu function
api/responses.ts                         Vercel orders function
api/responses/[personId]/extras.ts       Vercel extras update
api/drinks.ts                            Vercel list and create extras
api/drinks/[id].ts                       Vercel update and delete extra
api/data.json                            Same JSON as server/data.json; no importer in this repo
server/index.ts                          Express API
server/data.json                         Seed people for the setup scripts
scripts/setup-supabase.ts                npm run setup-supabase
scripts/setup-supabase-simple.ts         Upsert-only script, no npm script
src/App.tsx                              Tabs
src/api.ts                               Browser API client
src/types.ts                             Shared types
src/components/                          Tab components
supabase_setup.sql                       Table SQL for the SQL editor
vercel.json                              Build command, output directory, SPA rewrite
vite.config.ts                           Dev server port and /api proxy
```

## Vercel config

`vercel.json` sets `buildCommand` to `npm run build`, `outputDirectory` to `dist`, and rewrites `/(.*)` to `/index.html`.

For the functions under `api/`, set `SUPABASE_URL` and either `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in the Vercel project environment.

## Further setup

Table creation, credentials, and `npm run setup-supabase` are in [SUPABASE_SETUP.md](SUPABASE_SETUP.md). A checked inventory of routes, env vars, and schema differences is in [docs/STATE.md](docs/STATE.md).
