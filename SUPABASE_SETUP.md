# Supabase setup

The app reads and writes Supabase from `server/index.ts` and from the functions in `api/`. People already stored under `aces_christmas_meal` are updated by id. `POST /api/responses` returns `404` when `personId` is not in that table.

`supabase_setup.sql` is the SQL in this repo for creating `aces_christmas_meal`. The handlers also upsert an `extras` column on that table and use a second table, `drinks_items`. Neither of those objects is created by `supabase_setup.sql` or by `scripts/setup-supabase.ts`.

## 1. Create `aces_christmas_meal`

1. Open the Supabase dashboard and select the project.
2. Open **SQL Editor** and run the contents of `supabase_setup.sql`.

That script creates `aces_christmas_meal` with:

- `id` integer, primary key
- `name` text, not null
- `is_child` boolean, default `false`
- `has_paid` boolean, default `false`
- `order_data` jsonb
- `created_at` and `updated_at` timestamps

It also creates index `idx_aces_christmas_meal_id`, enables row level security, and adds policy `Allow all operations on aces_christmas_meal` for all commands with `USING (true)` and `WITH CHECK (true)`.

## 2. Credentials

In the Supabase dashboard, open **Settings → API** and copy:

- Project URL
- `anon` public key, for the running app
- service role key, for `npm run setup-supabase`

## 3. Local API environment

`server/index.ts` loads `.env` from the repo root through `dotenv/config`. It accepts either URL variable and either key:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

`NEXT_PUBLIC_SUPABASE_URL` is accepted in place of `SUPABASE_URL` by `server/index.ts` only. `SUPABASE_SERVICE_ROLE_KEY` is accepted in place of `SUPABASE_ANON_KEY` by both the local server and the `api/` functions.

The Vercel functions read `SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.

## 4. Load the people in `server/data.json`

`npm run setup-supabase` runs `scripts/setup-supabase.ts`.

That script does not load `.env`. Export both variables in the shell first:

```bash
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
npm run setup-supabase
```

The script then:

1. Calls `supabase.rpc('exec_sql', { sql })`. The SQL creates the same table, index, RLS enablement, and policy as `supabase_setup.sql`, and it also runs `DROP POLICY IF EXISTS "Allow all operations on aces_christmas_meal"` before `CREATE POLICY`.
2. If that RPC promise rejects, the script POSTs the same SQL to `{SUPABASE_URL}/rest/v1/rpc/exec_sql`. A resolved `{ error }` from `rpc` does not take this branch.
3. If the RPC result has an error, the script prints that `supabase_setup.sql` should be run in the SQL editor and exits before inserting rows.
4. Reads `server/data.json` and upserts each person on `id` with `name`, `is_child`, `has_paid`, and `order_data`.

The file has 17 people. `api/data.json` is a byte-for-byte copy and is not read by the script. The upsert does not send `extras`.

`scripts/setup-supabase-simple.ts` skips table creation. It selects from `aces_christmas_meal` and, when the error code is `42P01`, exits and tells you to run `supabase_setup.sql`. Otherwise it upserts `server/data.json`. `package.json` does not call this file. It also expects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment and does not load `.env`.

## 5. Vercel environment

In the Vercel project, set these for the environments you deploy:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

`api/responses.ts` logs `Successfully saved <count> people to Supabase` after an upsert.

## 6. `drinks_items` and `extras`

Manage Extras calls `/api/drinks`. Drinks & Extras writes `person.extras` with `PUT /api/responses/:personId/extras`, and that handler upserts the `extras` column on `aces_christmas_meal`. Receipt and To Be Paid call `GET /api/drinks` and read `extras` from `GET /api/responses`. Columns the drinks handlers send:

| When | Fields |
| --- | --- |
| Insert | `id`, `name`, `price`, `created_at` |
| Update | `name`, `price`, `updated_at` |

`id` is a string shaped like `drink_<timestamp>_<random>`. This repo has no SQL that creates `drinks_items` or adds `extras` to `aces_christmas_meal`.
