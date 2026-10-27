const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const ADMIN_API_URL = `${SUPABASE_URL}/functions/v1/admin-api`;

export interface BlockedIp {
  id: string;
  ip: string;
  reason: string | null;
  blocked_by: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface SuspiciousActivity {
  id: string;
  ip: string;
  type: string;
  detail: string | null;
  path: string | null;
  user_agent: string | null;
  created_at: string;
}

function baseHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  };
}

function adminHeaders(token: string): HeadersInit {
  return {
    ...baseHeaders(),
    'X-Admin-Token': token,
  };
}

export async function checkBlockedStatus(): Promise<{ blocked: boolean; reason: string | null }> {
  const res = await fetch(`${ADMIN_API_URL}/check-blocked`, {
    headers: baseHeaders(),
  });
  if (!res.ok) return { blocked: false, reason: null };
  const data = await res.json();
  return { blocked: !!data.blocked, reason: data.reason ?? null };
}

export async function adminLogin(password: string): Promise<{ token: string; expiresAt: string }> {
  const res = await fetch(`${ADMIN_API_URL}/login`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data?.error ?? `فشل تسجيل الدخول (${res.status})`);
  }
  return { token: data.token, expiresAt: data.expiresAt };
}

export async function adminLogout(token: string): Promise<void> {
  await fetch(`${ADMIN_API_URL}/logout`, {
    method: 'POST',
    headers: adminHeaders(token),
  });
}

export async function listBlockedIps(token: string): Promise<BlockedIp[]> {
  const res = await fetch(`${ADMIN_API_URL}/blocked`, {
    headers: adminHeaders(token),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data?.error ?? 'فشل قراءة القائمة');
  return data.blocked ?? [];
}

export async function blockIp(token: string, ip: string, reason?: string): Promise<void> {
  const res = await fetch(`${ADMIN_API_URL}/blocked`, {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify({ ip, reason, blockedBy: token }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data?.error ?? 'فشل الحظر');
}

export async function unblockIp(token: string, ip: string): Promise<void> {
  const res = await fetch(`${ADMIN_API_URL}/blocked`, {
    method: 'DELETE',
    headers: adminHeaders(token),
    body: JSON.stringify({ ip }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data?.error ?? 'فشل إلغاء الحظر');
}

export async function listActivities(token: string, limit = 200, offset = 0): Promise<SuspiciousActivity[]> {
  const res = await fetch(`${ADMIN_API_URL}/activities?limit=${limit}&offset=${offset}`, {
    headers: adminHeaders(token),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data?.error ?? 'فشل قراءة الأنشطة');
  return data.activities ?? [];
}

export async function getStats(token: string): Promise<{ blocked: number; activities: number }> {
  const res = await fetch(`${ADMIN_API_URL}/stats`, {
    headers: adminHeaders(token),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data?.error ?? 'فشل قراءة الإحصائيات');
  return data.stats ?? { blocked: 0, activities: 0 };
}
