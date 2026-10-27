/*
# Add email to issue_reports + enable realtime on key tables

1. Modified Tables
- `issue_reports`: add `email` column (text, nullable) to capture the reporter's
  email when they are signed in. Existing rows keep NULL — no data loss.

2. Realtime
- Add `issue_reports`, `blocked_ips`, and `suspicious_activities` to the
  realtime publication so the admin dashboard can receive live INSERT/UPDATE
  events without manual refresh.

3. Security
- No policy changes: issue_reports still allows anon+authenticated INSERT
  (the new email column is writable since the existing INSERT grant is
  table-wide) and service_role full access for admin reads.
*/

ALTER TABLE issue_reports ADD COLUMN IF NOT EXISTS email text;

-- Enable realtime for admin dashboard tables
ALTER PUBLICATION supabase_realtime ADD TABLE issue_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE blocked_ips;
ALTER PUBLICATION supabase_realtime ADD TABLE suspicious_activities;
