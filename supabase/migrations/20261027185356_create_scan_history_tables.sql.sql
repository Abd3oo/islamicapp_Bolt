/*
# Create scan history tables for hadith and product checks

1. New Tables
- `hadith_scans`: stores each hadith verification a user performs.
  - `id` uuid PK
  - `user_id` uuid NOT NULL DEFAULT auth.uid(), FK to auth.users, cascade delete
  - `hadith_text` text NOT NULL — the hadith the user searched
  - `status` text — raw status string from the AI (e.g. "صحيح", "ضعيف")
  - `status_label` text — mapped label shown to user
  - `source` text — cited source
  - `narrator` text — narrator info
  - `explanation` text — explanation text
  - `created_at` timestamptz DEFAULT now()
- `product_scans`: stores each product check a user performs.
  - `id` uuid PK
  - `user_id` uuid NOT NULL DEFAULT auth.uid(), FK to auth.users, cascade delete
  - `brand` text — product/brand name
  - `verdict` text — boycott | not_boycotted | local | unknown
  - `source` text — local_db | gemini
  - `parent_company` text
  - `country` text
  - `reason` text
  - `alternatives` text[] — array of alternative names
  - `created_at` timestamptz DEFAULT now()

2. Security
- Enable RLS on both tables.
- Grant SELECT, INSERT, DELETE to authenticated (no UPDATE needed).
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- user_id defaults to auth.uid() so client inserts that omit user_id succeed.

3. Indexes
- Index on (user_id, created_at desc) for fast history listing on both tables.
*/

CREATE TABLE IF NOT EXISTS hadith_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  hadith_text text NOT NULL,
  status text,
  status_label text,
  source text,
  narrator text,
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hadith_scans ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON hadith_scans TO authenticated;

DROP POLICY IF EXISTS "select_own_hadith_scans" ON hadith_scans;
CREATE POLICY "select_own_hadith_scans" ON hadith_scans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hadith_scans" ON hadith_scans;
CREATE POLICY "insert_own_hadith_scans" ON hadith_scans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_hadith_scans" ON hadith_scans;
CREATE POLICY "delete_own_hadith_scans" ON hadith_scans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS hadith_scans_user_created_idx
  ON hadith_scans (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS product_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  brand text,
  verdict text,
  source text,
  parent_company text,
  country text,
  reason text,
  alternatives text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE product_scans ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON product_scans TO authenticated;

DROP POLICY IF EXISTS "select_own_product_scans" ON product_scans;
CREATE POLICY "select_own_product_scans" ON product_scans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_product_scans" ON product_scans;
CREATE POLICY "insert_own_product_scans" ON product_scans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_product_scans" ON product_scans;
CREATE POLICY "delete_own_product_scans" ON product_scans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS product_scans_user_created_idx
  ON product_scans (user_id, created_at DESC);
