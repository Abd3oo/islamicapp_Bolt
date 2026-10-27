import { createClient } from '@supabase/supabase-js';
import { findLocalProduct, type LocalProduct } from './products';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/gemini-proxy`;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface HadithResult {
  status: string;
  source: string;
  narrator?: string;
  explanation: string;
}

export type ProductStatus = 'boycott' | 'not_boycotted' | 'local' | 'unknown';

export interface ProductResult {
  source: 'local_db' | 'gemini';
  status: ProductStatus;
  brand: string;
  parentCompany: string;
  country: string;
  reason: string;
  alternatives: string[];
}

export interface ErrorReport {
  brand: string;
  currentStatus?: string;
  correctStatus?: string;
  message: string;
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  };
}

export async function verifyHadith(text: string): Promise<HadithResult> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ type: 'hadith', text }),
  });
  const data = await res.json();
  if (!res.ok || !data?.ok || !data?.result) {
    throw new Error(data?.error ?? `فشل الطلب (${res.status})`);
  }
  return data.result as HadithResult;
}

function localToResult(p: LocalProduct): ProductResult {
  return {
    source: 'local_db',
    status: p.status,
    brand: p.brand,
    parentCompany: p.parentCompany,
    country: p.country,
    reason: p.reason,
    alternatives: p.alternatives,
  };
}

/**
 * analyzeProduct:
 * 1. Extract text from the image first (or accept an explicit brand query).
 * 2. Try the offline local DB — instant, no network.
 * 3. If not found, call Gemini for AI analysis.
 */
export async function analyzeProduct(
  image: string,
  opts?: { brandHint?: string }
): Promise<ProductResult> {
  // Fast path: if a brand hint was provided, check the local DB first.
  if (opts?.brandHint) {
    const local = findLocalProduct(opts.brandHint);
    if (local) return localToResult(local);
  }

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ type: 'product', image }),
  });
  const data = await res.json();
  if (!res.ok || !data?.ok || !data?.result) {
    throw new Error(data?.error ?? `فشل الطلب (${res.status})`);
  }
  const r = data.result as {
    status?: string;
    brand?: string;
    parent_company?: string;
    country?: string;
    reason?: string;
    alternatives?: string[];
  };

  const status: ProductStatus = normalizeStatus(r.status);
  const brand = r.brand ?? '';

  // If Gemini identified a brand, double-check the local DB for a richer record
  // (with curated alternatives) before falling back to the AI's answer.
  if (brand) {
    const local = findLocalProduct(brand);
    if (local) return localToResult(local);
  }

  return {
    source: 'gemini',
    status,
    brand,
    parentCompany: r.parent_company ?? '',
    country: r.country ?? '',
    reason: r.reason ?? '',
    alternatives: Array.isArray(r.alternatives) ? r.alternatives : [],
  };
}

function normalizeStatus(s?: string): ProductStatus {
  const v = (s ?? '').trim().toLowerCase();
  if (v === 'boycott') return 'boycott';
  if (v === 'not_boycotted' || v === 'not boycotted' || v === 'foreign') return 'not_boycotted';
  if (v === 'local' || v === 'arabic') return 'local';
  return 'unknown';
}

export async function submitErrorReport(report: ErrorReport): Promise<void> {
  const { error } = await supabase.from('error_reports').insert({
    brand: report.brand || 'عام',
    current_status: report.currentStatus,
    correct_status: report.correctStatus,
    message: report.message,
  });
  if (error) throw new Error(error.message ?? 'تعذّر إرسال البلاغ');
}

export async function submitIssueReport(message: string, page?: string, email?: string): Promise<void> {
  const { error } = await supabase.from('issue_reports').insert({
    message,
    page: page ?? null,
    email: email ?? null,
  });
  if (error) throw new Error(error.message ?? 'تعذّر إرسال البلاغ');
}
