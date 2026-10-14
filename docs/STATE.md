# State of the tree

Inventory of this repository from `package.json`, `vite.config.ts`, `vercel.json`, `tsconfig.json`, `server/index.ts`, `api/`, `src/`, `scripts/`, `supabase_setup.sql`, and the two `data.json` files. No Supabase project and no Vercel deployment were queried.

## App

- `index.html` title: `ACES Christmas Meal`
- Header in `src/App.tsx`: `ACES Christmas Meal`
- View Orders heading in `src/components/ResponsesView.tsx`: `Sunday Lunch Pre-Order`
- Tabs: Order Form, View Orders, Manage Extras, Drinks & Extras, Receipt, To Be Paid

## npm scripts

| Name | Script |
| --- | --- |
| `dev` | `vite` |
| `build` | `tsc && vite build` |
| `preview` | `vite preview` |
| `server` | `tsx watch server/index.ts` |
| `type-check` | `tsc --noEmit` |
| `setup-supabase` | `tsx scripts/setup-supabase.ts` |

`tsconfig.json` includes `src` and `server`, with `noEmit: true`. `api/` is not in that include list.

Lockfile engines used by those scripts: `vite@5.4.21` requires Node `^18.0.0 || >=20.0.0`; `tsx@4.21.0` requires Node `>=18.0.0`. `package.json` has no `engines` field.

## Local ports

- Express: `3001` in `server/index.ts`
- Vite dev server: `5173`, with `server.proxy['/api']` → `http://localhost:3001`
- `.env` is loaded for the Express process (`import 'dotenv/config'`)

## Environment variables read in code

| Variable | Express | `api/*.ts` | `scripts/setup-supabase.ts` |
| --- | --- | --- | --- |
| `SUPABASE_URL` | yes | yes | yes, required |
| `NEXT_PUBLIC_SUPABASE_URL` | yes, if `SUPABASE_URL` is unset | no | no |
| `SUPABASE_ANON_KEY` | yes | yes | no |
| `SUPABASE_SERVICE_ROLE_KEY` | yes, if anon key is unset | yes, if anon key is unset | yes, required |

The setup script does not load `.env`.

## Routes implemented in both servers

- `GET /api/menu`
- `GET /api/responses`
- `POST /api/responses`
- `GET /api/drinks`
- `POST /api/drinks`
- `PUT /api/drinks/:id`
- `DELETE /api/drinks/:id`
- `PUT /api/responses/:personId/extras`

Express `POST /api/responses` also reads `depositPaid` when `hasPaid` is absent. `src/components/OrderForm.tsx` sends `hasPaid`.

## Tables

Handlers upsert `aces_christmas_meal` with `id`, `name`, `is_child`, `has_paid`, `order_data`, `extras`, `updated_at`.

Handlers use `drinks_items` with string `id`, `name`, `price`, `created_at` on insert, and `updated_at` on update.

`supabase_setup.sql` creates `aces_christmas_meal` plus index `idx_aces_christmas_meal_id`, enables RLS, and adds policy `Allow all operations on aces_christmas_meal`. Its column list is `id`, `name`, `is_child`, `has_paid`, `order_data`, `created_at`, `updated_at`.

## Seed file

`server/data.json` and `api/data.json` match. 17 people, ids 1–17. Fields on each person: `id`, `name`, `isChild`, `hasPaid`, `order`. The setup scripts read `server/data.json` only.

Some `order` values are `null`. Other orders use `starter`, `sundayRoast`, `sides`, `dessert`, `notes`, or `kidsOrder`. Ids 3 (Raja) and 9 (Emmy) are `{ "kidsOrder": "pasta" }`. Id 8 (Rach) has starter `Roast celeriac soup, woodland mushroom toastie`, which is not a name in the hardcoded menu arrays.

## Vercel file

`vercel.json`:

- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- rewrite `/(.*)` → `/index.html`

## Files with no importer

- `api/data.json`
- `scripts/setup-supabase-simple.ts` (present, not listed in `package.json` scripts)
- `ServiceChargeSettings` in `src/types.ts` (exported, no other references)

## Unchecked from this tree

- Whether the linked Supabase project already has column `extras` or table `drinks_items`. The repo SQL does not create them.
- Whether the `vercel.json` rewrite is applied to `/api/*` on Vercel. The `api/` handlers are in the tree; this pass did not deploy them.
- `index.html` references `/vite.svg`. The repo contains no `.svg` file.
- Drinks & Extras, when `drinks_items` is empty, tells the reader to use a tab named `Manage Drinks`. The tab label in `src/App.tsx` is `Manage Extras`.
