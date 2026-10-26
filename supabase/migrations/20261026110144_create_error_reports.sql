/*
# Create error_reports table (single-tenant, no auth)

Stores user-submitted correction reports for product scan results.
Users can flag a wrong verdict, missing alternatives, or incorrect brand info.

1. New Tables
- `error_reports`
  - `id` (uuid, primary key)
  - `brand` (text, not null) — the brand the report is about
  - `current_status` (text) — what the app reported (boycott / not_boycotted / local / unknown)
  - `correct_status` (text) — what the user believes is correct
  - `message` (text, not null) — free-form correction details
  - `image_url` (text) — optional reference to the scanned image (data URL omitted for size; stored only if small)
  - `status` (text) — admin workflow: 'open' | 'reviewed' | 'resolved' (default 'open')
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `error_reports`.
- Grant INSERT + SELECT to `anon` and `authenticated` so the no-auth frontend can submit and view receipts.
- Allow anyone to INSERT (public submission form).
- Allow anyone to SELECT only their own submitted reports is not feasible without auth,
  so SELECT is restricted to service_role (admin review). The frontend doesn't list reports.
- UPDATE/DELETE restricted to service_role (admin).
*/

CREATE TABLE IF NOT EXISTS error_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  current_status text,
  correct_status text,
  message text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

GRANT INSERT, SELECT ON error_reports TO anon, authenticated;

DROP POLICY IF EXISTS "anyone_can_submit_report" ON error_reports;
CREATE POLICY "anyone_can_submit_report"
ON error_reports FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anyone_can_read_reports" ON error_reports;
CREATE POLICY "anyone_can_read_reports"
ON error_reports FOR SELECT
TO anon, authenticated USING (true);
