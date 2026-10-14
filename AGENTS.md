# AGENTS.md

Facts for editing this repo. Checked against `package.json`, `vite.config.ts`, `vercel.json`, `server/index.ts`, `api/`, `scripts/`, and `supabase_setup.sql`.

## Commands

```bash
npm install
npm run server    # tsx watch server/index.ts, port 3001, loads .env
npm run dev       # vite on port 5173, proxies /api to :3001
npm run type-check
npm run build     # tsc && vite build → dist
npm run preview   # vite preview; vite.config.ts does not set preview.port
npm run setup-supabase
```

`package.json` has no `lint` or `test` script. ESLint packages are in `devDependencies`. There is no eslint config file in the repo.

`npm run type-check` uses `tsconfig.json`, which includes `src` and `server` only. `api/` is outside that project. `tsconfig.node.json` covers `vite.config.ts` and is not referenced from `tsconfig.json`.

## Two copies of the API

Keep `server/index.ts` and the files under `api/` in mind together. The browser only calls `/api/...` (`src/api.ts`).

| Topic | `server/index.ts` | `api/` |
| --- | --- | --- |
| URL env | `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | `SUPABASE_URL` |
| Key env | `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` | same two keys |
| `POST /api/responses` payment field | `hasPaid`, else `depositPaid` | `hasPaid` |
| Missing Supabase on `GET /api/drinks` | `200` and `[]` | `500` `{ "error": "Supabase not configured" }` |
| Menu | `menuData` in this file | `menuData` in `api/menu.ts` |

Menu names and prices are duplicated in those two files. Orders store the selected name string. Price lookup finds that string in the menu array; an unknown name contributes `0`.

`POST /api/responses` and `PUT /api/responses/:personId/extras` update a person who is already in `aces_christmas_meal`. A missing id returns `404`.

## Setup script

`npm run setup-supabase` → `scripts/setup-supabase.ts`.

- Does not import `dotenv`. Needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` already in the environment.
- Calls `supabase.rpc('exec_sql', { sql })`. If that promise rejects, it POSTs the same SQL to `{SUPABASE_URL}/rest/v1/rpc/exec_sql`. A resolved `{ error }` does not take that branch; the script then tells you to run `supabase_setup.sql` and exits before the upsert.
- The SQL string is the table, index, RLS, and policy from `supabase_setup.sql`, plus `DROP POLICY IF EXISTS` before `CREATE POLICY`. It does not add `extras` or create `drinks_items`.
- Upserts `server/data.json` (`id`, `name`, `is_child`, `has_paid`, `order_data`) after the RPC reports success.
- `scripts/setup-supabase-simple.ts` is not an npm script.

## Schema the handlers write

Upserts to `aces_christmas_meal` include `extras` (json array) and `updated_at`. Drinks routes use table `drinks_items` with `id`, `name`, `price`, `created_at`, `updated_at`. `supabase_setup.sql` does not define `extras` or `drinks_items`.

## Seed JSON

`server/data.json` and `api/data.json` contain the same 17 people. Only the setup scripts read `server/data.json`. Nothing in `src/`, `server/index.ts`, or `api/*.ts` imports either file.

Raja (id 3) and Emmy (id 9) have `order: { "kidsOrder": "pasta" }`. The form and views read `main`, `sundayRoast`, and `dessert` on a child order.

## UI amounts that are constants in components

- Receipt and To Be Paid initialize service charge state to `12.5`. The value stays in React state.
- To Be Paid subtracts `15` for every adult whose food-plus-extras subtotal is greater than `0`. It does not read `hasPaid`.
- The Order Form stores the adult checkbox as `hasPaid` → column `has_paid`.

`ServiceChargeSettings` in `src/types.ts` is not referenced by other files.

## Deploy config

`vercel.json` build command is `npm run build`, output directory is `dist`, and `/(.*)` rewrites to `/index.html`. `index.html` links `/vite.svg`. No `.svg` file is in the repo.
