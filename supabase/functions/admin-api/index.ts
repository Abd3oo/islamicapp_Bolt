import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Admin-Token",
};

interface SupabaseConfig {
  url: string;
  serviceKey: string;
}

function getSupabase(): SupabaseConfig {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) throw new Error("missing supabase config");
  return { url, serviceKey };
}

function adminClient() {
  const { url, serviceKey } = getSupabase();
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// --- Admin auth ---
async function verifyAdminToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  const sb = adminClient();
  const { data, error } = await sb
    .from("admin_tokens")
    .select("id, expires_at, revoked_at")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return false;
  if (data.revoked_at) return false;
  if (new Date(data.expires_at).getTime() < Date.now()) return false;
  return true;
}

function adminError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

// --- Login ---
async function handleLogin(body: { password?: string }, ip: string): Promise<Response> {
  const password = (body?.password ?? "").trim();
  const adminPassword = Deno.env.get("ADMIN_PASSWORD") ?? "";
  if (!adminPassword) {
    return adminError(500, "كلمة مرور الأدمن غير مهيأة. أضف ADMIN_PASSWORD كـ secret.");
  }
  // Constant-time-ish comparison
  if (password.length !== adminPassword.length || password !== adminPassword) {
    // log suspicious failed login
    const sb = adminClient();
    await sb.from("suspicious_activities").insert({
      ip,
      type: "failed_admin_login",
      detail: "محاولة دخول أدمن خاطئة",
      path: "admin/login",
    }).then(() => {});
    return adminError(401, "كلمة المرور غير صحيحة");
  }

  const token = crypto.randomUUID() + "-" + crypto.randomUUID();
  const expires = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12h
  const sb = adminClient();
  const { error } = await sb.from("admin_tokens").insert({
    token,
    expires_at: expires,
  });
  if (error) return adminError(500, "تعذّر إنشاء الجلسة");

  return new Response(JSON.stringify({ ok: true, token, expiresAt: expires }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- Logout ---
async function handleLogout(token: string): Promise<Response> {
  const sb = adminClient();
  await sb.from("admin_tokens").update({ revoked_at: new Date().toISOString() }).eq("token", token).then(() => {});
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- List blocked IPs ---
async function listBlocked(): Promise<Response> {
  const sb = adminClient();
  const { data, error } = await sb
    .from("blocked_ips")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return adminError(500, "تعذّر قراءة قائمة الحظر");
  return new Response(JSON.stringify({ ok: true, blocked: data ?? [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- Block an IP ---
async function blockIp(body: { ip?: string; reason?: string; blockedBy?: string }, actor: string): Promise<Response> {
  const ip = (body?.ip ?? "").trim();
  if (!ip || !/^[\d.:a-fA-F]+$/.test(ip)) return adminError(400, "عنوان IP غير صالح");
  const sb = adminClient();
  const { error } = await sb.from("blocked_ips").upsert(
    {
      ip,
      reason: body?.reason?.trim() || null,
      blocked_by: actor,
    },
    { onConflict: "ip" }
  );
  if (error) return adminError(500, "تعذّر حظر الـ IP");
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- Unblock an IP ---
async function unblockIp(body: { ip?: string }): Promise<Response> {
  const ip = (body?.ip ?? "").trim();
  if (!ip) return adminError(400, "عنوان IP مطلوب");
  const sb = adminClient();
  const { error } = await sb.from("blocked_ips").delete().eq("ip", ip);
  if (error) return adminError(500, "تعذّر إلغاء الحظر");
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- List suspicious activities ---
async function listActivities(limit = 200, offset = 0): Promise<Response> {
  const sb = adminClient();
  const { data, error } = await sb
    .from("suspicious_activities")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return adminError(500, "تعذّر قراءة الأنشطة المشبوهة");
  return new Response(JSON.stringify({ ok: true, activities: data ?? [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- Public: check if caller's IP is blocked ---
async function checkBlocked(ip: string): Promise<Response> {
  const sb = adminClient();
  const { data } = await sb
    .from("blocked_ips")
    .select("ip, reason, created_at")
    .eq("ip", ip)
    .maybeSingle();
  return new Response(
    JSON.stringify({ ok: true, blocked: !!data, reason: data?.reason ?? null }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// --- List registered users (from auth.users via service_role) ---
async function listUsers(): Promise<Response> {
  const sb = adminClient();
  const { data, error } = await sb.auth.admin.listUsers();
  if (error) return adminError(500, "تعذّر قراءة قائمة المستخدمين");
  const users = (data.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }));
  return new Response(JSON.stringify({ ok: true, users }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- List user complaints (issue_reports) ---
async function listComplaints(limit: number, offset: number): Promise<Response> {
  const sb = adminClient();
  const { data, error } = await sb
    .from("issue_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return adminError(500, "تعذّر قراءة الشكاوى");
  return new Response(JSON.stringify({ ok: true, complaints: data ?? [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  const ip = getClientIp(req);

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/admin-api\/?/, "") || "/";
    const adminToken = req.headers.get("x-admin-token");

    // Public routes (no auth)
    if (path === "check-blocked" || path === "/check-blocked") {
      return await checkBlocked(ip);
    }

    // Login route
    if (path === "login" || path === "/login") {
      if (req.method !== "POST") return adminError(405, "Method not allowed");
      const body = await req.json();
      return await handleLogin(body, ip);
    }

    // Everything below requires admin token
    const isAdmin = await verifyAdminToken(adminToken);
    if (!isAdmin) return adminError(401, "غير مصرح — سجّل الدخول أولاً");

    if (path === "logout" || path === "/logout") {
      return await handleLogout(adminToken!);
    }

    if (path === "blocked" || path === "/blocked") {
      if (req.method === "GET") return await listBlocked();
      if (req.method === "POST") {
        const body = await req.json();
        return await blockIp(body, adminToken!);
      }
      if (req.method === "DELETE") {
        const body = await req.json();
        return await unblockIp(body);
      }
      return adminError(405, "Method not allowed");
    }

    if (path === "activities" || path === "/activities") {
      const limit = parseInt(url.searchParams.get("limit") ?? "200", 10);
      const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
      return await listActivities(limit, offset);
    }

    if (path === "users" || path === "/users") {
      return await listUsers();
    }

    if (path === "complaints" || path === "/complaints") {
      const limit = parseInt(url.searchParams.get("limit") ?? "200", 10);
      const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
      return await listComplaints(limit, offset);
    }

    if (path === "stats" || path === "/stats") {
      const sb = adminClient();
      const [{ count: blockedCount }, { count: activitiesCount }, { count: usersCount }, { count: complaintsCount }] = await Promise.all([
        sb.from("blocked_ips").select("*", { count: "exact", head: true }),
        sb.from("suspicious_activities").select("*", { count: "exact", head: true }),
        sb.from("auth.users").select("*", { count: "exact", head: true }),
        sb.from("issue_reports").select("*", { count: "exact", head: true }),
      ]);
      return new Response(
        JSON.stringify({ ok: true, stats: { blocked: blockedCount ?? 0, activities: activitiesCount ?? 0, users: usersCount ?? 0, complaints: complaintsCount ?? 0 } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return adminError(404, "مسار غير معروف");
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "حدث خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
