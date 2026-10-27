/*
# Security system: blocked IPs + suspicious activities

Creates the schema for the admin security/firewall system.

1. New Tables
- `blocked_ips`: IP blacklist. Columns: id, ip, reason, blocked_by, created_at, expires_at.
- `suspicious_activities`: log of suspicious events. Columns: id, ip, type, detail, path, user_agent, created_at.
- `admin_tokens`: single-use session tokens for admin auth. Columns: id, token, created_at, expires_at, revoked_at.
  (No password table: the admin password is stored as a hashed secret in edge-function env,
   and a successful login mints a row here that the dashboard sends with each request.)

2. Security
- RLS enabled on all tables.
- blocked_ips: SELECT to anon+authenticated (so the edge function's public check can read it),
  but INSERT/UPDATE/DELETE only via service_role (admin actions go through the edge function
  using SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS).
- suspicious_activities: INSERT to anon+authenticated (anyone can log a sighting — the edge
  function writes here); SELECT only via service_role (admin-only reads).
- admin_tokens: INSERT via service_role (issued on login); SELECT/UPDATE via service_role.
  No anon SELECT — tokens must not be enumerable.
*/

CREATE TABLE IF NOT EXISTS blocked_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL UNIQUE,
  reason text,
  blocked_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON blocked_ips TO anon, authenticated;

DROP POLICY IF EXISTS "anyone_can_read_blocked" ON blocked_ips;
CREATE POLICY "anyone_can_read_blocked"
ON blocked_ips FOR SELECT
TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS suspicious_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  type text NOT NULL,
  detail text,
  path text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE suspicious_activities ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON suspicious_activities TO anon, authenticated;

DROP POLICY IF EXISTS "anyone_can_log_activity" ON suspicious_activities;
CREATE POLICY "anyone_can_log_activity"
ON suspicious_activities FOR INSERT
TO anon, authenticated WITH CHECK (true);


CREATE TABLE IF NOT EXISTS admin_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '12 hours'),
  revoked_at timestamptz
);

ALTER TABLE admin_tokens ENABLE ROW LEVEL SECURITY;

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON blocked_ips (ip);
CREATE INDEX IF NOT EXISTS idx_activities_ip ON suspicious_activities (ip);
CREATE INDEX IF NOT EXISTS idx_activities_created ON suspicious_activities (created_at DESC);
