// Edge function: gemini-proxy
// Holds the GEMINI_API_KEY as a server-side secret and proxies two kinds of
// requests from the Najma frontend:
//   1. Hadith verification   ({ type: "hadith", text })
//   2. Product image analysis ({ type: "product", image: "data:image/jpeg;base64,..." })
// The key never reaches the browser.
//
// Robustness: tries multiple Gemini models in order, with per-request timeout,
// so a single model being overloaded or deprecated doesn't break the app.
// Security: checks IP blacklist + logs suspicious input patterns.


import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

async function isIpBlocked(ip: string): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) return false;
  try {
    const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data } = await sb.from("blocked_ips").select("ip").eq("ip", ip).maybeSingle();
    return !!data;
  } catch {
    // If the block-check itself fails, fail open (don't block legitimate users)
    return false;
  }
}

// Heuristic patterns for injection / XSS attempts in text inputs.
const SUSPICIOUS_PATTERNS = [
  /(\bunion\b.+\b(select|insert|update|delete|drop)\b)/i,
  /'(--|;\s*drop|;\s*select|;\s*update|;\s*insert)/i,
  /<\s*script/i,
  /on(error|load|click|mouseover|focus)\s*=/i,
  /javascript:/i,
  /\bor\s+1\s*=\s*1/i,
  /\bselect\b.+\bfrom\b/i,
  /<\s*img[^>]+onerror/i,
  /<\s*iframe/i,
  /<\s*svg[^>]+onload/i,
];

function detectSuspicious(text: string): string | null {
  if (!text || typeof text !== "string") return null;
  for (const pat of SUSPICIOUS_PATTERNS) {
    if (pat.test(text)) {
      if (/<\s*script|javascript:|onerror|onload\s*=|<\s*iframe|<\s*svg/i.test(text)) return "xss_attempt";
      return "sql_injection_attempt";
    }
  }
  return null;
}

async function logActivity(ip: string, type: string, detail: string, path: string): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) return;
  try {
    const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
    await sb.from("suspicious_activities").insert({ ip, type, detail, path });
  } catch {
    // best-effort logging
  }
}

// Models tried in order — newest/stablest first, with reliable fallbacks.
// Models tried in order — start with the one confirmed available & fast,
// then fallback to others that may recover from overload.
const GEMINI_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

const REQUEST_TIMEOUT_MS = 60000;

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string; status?: string };
}

const HADITH_PROMPT = `أنت عالم متخصص في الحديث النبوي الشريف ومصطلح الحديث.
سيعطيك المستخدم نصاً لشيء يُشاع على أنه حديث نبوي.
مهمتك:
1. تحديد ما إذا كان الحديث: "صحيح" أو "حسن" أو "ضعيف" أو "موضوع" أو "لا أصل له".
2. ذكر المصدر باختصار (الكتاب ورقم الحديث إن وُجد).
3. ذكر الراوي باختصار إن وُجد.
4. شرح موجز لمعنى الحديث في جملة أو جملتين.
5. إن لم يكن حديثاً معروفاً أو لم تجده، اعتبره "لا أصل له" واذكر أن النص غير معروف في كتب الحديث.

أجب بصيغة JSON فقط بدون أي نص إضافي، بالشكل التالي:
{
  "status": "صحيح" | "حسن" | "ضعيف" | "موضوع" | "لا أصل له",
  "source": "اسم المصدر",
  "narrator": "اسم الراوي أو نص فارغ",
  "explanation": "الشرح الموجز"
}`;

const PRODUCT_PROMPT = `أنت خبير ومساعد ذكي متخصص في تحليل صور المنتجات وتحديد موقفها من المقاطعة بدقة عالية ودون خلط.
عند تلقي صورة أو اسم أي منتج، التزم بالتعليمات والقواعد التالية بشكل صارم:

1. المعايير المعتمدة للمقاطعة:
   - لا تُصنّف أي شركة على أنها "مقاطعة" لمجرد أنها شركة أجنبية أو غربية المنشأ.
   - يُصنف المنتج على أنه "مقاطعة" فقط إذا كان تابعاً لشركة مدرجة ضمن قوائم المقاطعة الرسمية المعتمدة (مثل حركة BDS) أو لها تورط ودعم مباشر ومثبت للكيان الصهيوني.
   - الماركات المملوكة لشركات غير متورطة في الدعم المباشر (مثل McVitie's المملوكة لشركة Yıldız Holding التركية عبر pladis) تُعتبر "غير مقاطعة / غير مدرج".
   - المنتجات العربية أو المحلية من دول عربية تُصنّف "منتج محلي".

2. التصنيفات المسموح بها فقط (status):
   - "boycott" -> للشركات المتورطة والداعمة بشكل مباشر للكيان الصهيوني أو المدرجة في قوائم المقاطعة الرسمية.
   - "not_boycotted" -> للشركات الأجنبية غير المتورطة (حتى لو كانت أجنبية، مع توضيح جنسيتها).
   - "local" -> للمنتجات الوطنية/المحلية من الدول العربية.
   - "unknown" -> فقط إذا تعذّر التعرف على المنتج بوضوح.

ملاحظات:
- ابحث عن الاسم، الشعار، بلد المنشأ، والباركود إن وُجد.
- لا تقم بالافتراض أو التعميم: لا تصنّف كـ "boycott" ما لم يكن التورط مثبتاً ومباشراً.

أجب بصيغة JSON فقط بدون أي نص إضافي، بالشكل:
{
  "status": "boycott" | "not_boycotted" | "local" | "unknown",
  "brand": "اسم المنتج / العلامة التجارية أو نص فارغ",
  "parent_company": "اسم الشركة الأم وجنسيتها (مثال: Yıldız Holding، تركيا) أو نص فارغ",
  "country": "بلد المنشأ أو نص فارغ",
  "reason": "التوضيح والسبب: شرح مختصر ودقيق بدون تخمين",
  "alternatives": ["بديل محلي 1", "بديل محلي 2"] | []
}

قواعد إضافية:
- إذا كانت الحالة "boycott"، اذكر 2 إلى 4 بدائل محلية أو عربية متاحة لنفس نوع المنتج.
- إذا كانت الحالة "not_boycotted" أو "local" أو "unknown"، اترك alternatives كمصفوفة فارغة [].
- لا تخترع أسماء بدائل وهمية؛ اكتب أسماء فئات أو علامات معروفة فعلاً.`;

function extractJson(text: string): unknown {
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return JSON.parse(cleaned);
}

class TransientError extends Error {}

async function callModel(model: string, parts: GeminiPart[], apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
      signal: controller.signal,
    });
    const data: GeminiResponse = await res.json();
    if (!res.ok) {
      const msg = data.error?.message ?? `HTTP ${res.status}`;
      // Overload / deprecated / unavailable → try next model
      if (res.status === 429 || res.status === 503 || /no longer available|not found|deprecated|overloaded|demand/i.test(msg)) {
        throw new TransientError(msg);
      }
      throw new Error(`Gemini API error: ${msg}`);
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new TransientError("empty response");
    return text;
  } catch (err) {
    if (err instanceof TransientError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new TransientError("request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(parts: GeminiPart[], apiKey: string): Promise<string> {
  let lastErr: Error | null = null;
  for (const model of GEMINI_MODELS) {
    try {
      return await callModel(model, parts, apiKey);
    } catch (err) {
      if (err instanceof TransientError) {
        lastErr = err;
        continue; // try next model
      }
      throw err; // non-transient: stop
    }
  }
  throw new Error(
    lastErr
      ? `تعذّر الوصول إلى نموذج Gemini (جميع المحاولات فشلت). حاول مرة أخرى بعد قليل.`
      : "تعذّر الوصول إلى نموذج Gemini."
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "لم يتم إعداد مفتاح Gemini بعد. أضف المفتاح كـ secret باسم GEMINI_API_KEY." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const clientIp = getClientIp(req);

  // Block check: reject requests from blacklisted IPs at the server level
  if (await isIpBlocked(clientIp)) {
    await logActivity(clientIp, "blocked_access_attempt", "محاولة وصول من IP محظور", "gemini-proxy");
    return new Response(
      JSON.stringify({ error: "تم حظر جهازك من استخدام هذه الخدمة لأسباب أمنية.", blocked: true }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const type = body?.type;

    if (type === "test-model") {
      const model = body?.model ?? GEMINI_MODELS[0];
      try {
        const raw = await callModel(model, [{ text: "قول: مرحبا" }], apiKey);
        return new Response(
          JSON.stringify({ ok: true, model, reply: raw.slice(0, 200) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ ok: false, model, error: err?.message ?? String(err) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (type === "list-models") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`,
        { method: "GET" }
      );
      const data = await res.json();
      const names = (data.models ?? []).map((m: { name: string }) => m.name).join("\n");
      return new Response(
        JSON.stringify({ ok: true, models: names, raw: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "hadith") {
      const text: string = body?.text?.trim();
      if (!text) {
        return new Response(
          JSON.stringify({ error: "النص فارغ" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Check for suspicious input (SQL injection / XSS patterns)
      const susType = detectSuspicious(text);
      if (susType) {
        await logActivity(clientIp, susType, `حقل الحديث: ${text.slice(0, 200)}`, "hadith");
        return new Response(
          JSON.stringify({ error: "تم رصد إدخال مشبوه وتم تسجيله." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const raw = await callGemini([{ text: `${HADITH_PROMPT}\n\nالنص: ${text}` }], apiKey);
      const parsed = extractJson(raw);
      return new Response(
        JSON.stringify({ ok: true, result: parsed }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "product") {
      const image: string = body?.image;
      if (!image || !image.startsWith("data:image")) {
        return new Response(
          JSON.stringify({ error: "صورة غير صالحة" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const match = image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (!match) {
        return new Response(
          JSON.stringify({ error: "صورة غير صالحة" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const mimeType = match[1];
      const base64 = match[2];
      const raw = await callGemini(
        [
          { text: PRODUCT_PROMPT },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
        apiKey
      );
      const parsed = extractJson(raw);
      return new Response(
        JSON.stringify({ ok: true, result: parsed }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "نوع الطلب غير معروف" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "حدث خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
