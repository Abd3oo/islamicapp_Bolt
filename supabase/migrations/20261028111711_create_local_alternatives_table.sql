/*
# Create local_alternatives table

## Purpose
Lets the admin manage per-country, per-category local alternative brands that
appear in the Scanner results when a boycotted product is detected. Replaces
the hard-coded list in src/lib/alternatives.ts with editable, DB-backed data.

## New Tables
- `local_alternatives`
  - `id` (uuid, primary key)
  - `country` (text, not null) — Arabic country name (e.g. "مصر", "السعودية")
  - `category` (text, not null) — category key (e.g. "snacks", "beverages", "general")
  - `brand_name` (text, not null) — a single local alternative brand name
  - `created_at` (timestamptz, default now())
  - Unique constraint on (country, category, brand_name) so duplicates can't be added.

## Security
- RLS enabled.
- SELECT granted to `anon, authenticated` so the public Scanner can read alternatives.
- INSERT / UPDATE / DELETE granted to `authenticated` only — but actual writes go
  through the admin-api edge function using the service_role key, so the admin
  UI (which uses the anon key + X-Admin-Token) calls the edge function, not the
  table directly. The authenticated grants are a safety net for any future
  server-side use.
- Public read policy (anon + authenticated) since alternatives are shared/public data.
- No public write policies — all writes go through the edge function with service_role.

## Notes
1. The edge function `admin-api` will gain new routes: GET/POST/DELETE
   `/alternatives`, all guarded by the existing X-Admin-Token verification.
2. The frontend `alternatives.ts` will fetch from this table at runtime and
   fall back to the existing hard-coded list if the table is empty or unreachable.
*/

CREATE TABLE IF NOT EXISTS local_alternatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  category text NOT NULL,
  brand_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country, category, brand_name)
);

ALTER TABLE local_alternatives ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON local_alternatives TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON local_alternatives TO authenticated;

DROP POLICY IF EXISTS "public_read_alternatives" ON local_alternatives;
CREATE POLICY "public_read_alternatives"
ON local_alternatives FOR SELECT
TO anon, authenticated USING (true);
