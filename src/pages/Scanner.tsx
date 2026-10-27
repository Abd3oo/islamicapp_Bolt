import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, RotateCcw, ScanLine, Loader2, CheckCircle2, XCircle, AlertCircle,
  CameraOff, Image as ImageIcon, X, Search, Flag, Sparkles, Building2, MapPin,
  Lightbulb, History, Trash2, Clock,
} from 'lucide-react';
import { analyzeProduct, type ProductResult } from '../lib/gemini';
import { findLocalProduct } from '../lib/products';
import ReportModal from '../components/ReportModal';
import { supabase } from '../lib/gemini';
import { useAuth } from '../lib/auth';
import { getCountryCategoryAlternatives, detectCategory, categoryLabel, type Country } from '../lib/alternatives';

type Verdict = 'boycott' | 'not_boycotted' | 'local' | 'unknown';

interface ScanState {
  status: 'idle' | 'scanning' | 'result';
  verdict?: Verdict;
  source?: 'local_db' | 'gemini';
  brand?: string;
  parentCompany?: string;
  country?: string;
  reason?: string;
  alternatives?: string[];
  capturedImage?: string;
  error?: string;
}

const verdictInfo: Record<Verdict, { label: string; desc: string; color: string; bg: string; border: string; ring: string; icon: typeof CheckCircle2 }> = {
  boycott: {
    label: 'منتج مقاطَع',
    desc: 'هذا المنتج من العلامات التجارية الموصى بمقاطعتها لارتباطها بالكيان الصهيوني.',
    color: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    ring: 'shadow-rose-500/20',
    icon: XCircle,
  },
  not_boycotted: {
    label: 'غير مقاطعة / غير مدرج',
    desc: 'منتج أجنبي غير مدرج في قوائم المقاطعة الرسمية وغير متورط في دعم الكيان الصهيوني.',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    ring: 'shadow-amber-500/20',
    icon: AlertCircle,
  },
  local: {
    label: 'منتج محلي',
    desc: 'منتج من علامة محلية أو عربية. دعمك له يساهم في تقوية الاقتصاد العربي.',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    ring: 'shadow-emerald-500/20',
    icon: CheckCircle2,
  },
  unknown: {
    label: 'لم يتم التعرف',
    desc: 'لم تتمكن نجمة من التعرف على المنتج بوضوح. حاول التقاط صورة أوضح أو ابحث بالاسم.',
    color: 'text-sky-300',
    bg: 'bg-navy-500/10',
    border: 'border-white/15',
    ring: 'shadow-navy-500/20',
    icon: AlertCircle,
  },
};

function toVerdict(s: string): Verdict {
  const v = (s ?? '').trim().toLowerCase();
  if (v === 'boycott') return 'boycott';
  if (v === 'not_boycotted' || v === 'not boycotted' || v === 'foreign') return 'not_boycotted';
  if (v === 'local' || v === 'arabic') return 'local';
  return 'unknown';
}

export default function Scanner({ country }: { country: Country }) {
  const [state, setState] = useState<ScanState>({ status: 'idle' });
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [brandQuery, setBrandQuery] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [history, setHistory] = useState<ProductHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  interface ProductHistoryItem {
    id: string;
    brand: string | null;
    verdict: string | null;
    source: string | null;
    created_at: string;
  }

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_scans')
        .select('id, brand, verdict, source, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setHistory(data ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const saveScan = async (s: ScanState) => {
    if (!user || !s.verdict || s.error) return;
    await supabase.from('product_scans').insert({
      brand: s.brand ?? null,
      verdict: s.verdict,
      source: s.source ?? null,
      parent_company: s.parentCompany ?? null,
      country: s.country ?? null,
      reason: s.reason ?? null,
      alternatives: s.alternatives ?? null,
    });
    loadHistory();
  };

  const deleteHistoryItem = async (id: string) => {
    setHistory((h) => h.filter((x) => x.id !== id));
    await supabase.from('product_scans').delete().eq('id', id);
  };

  const clearHistory = async () => {
    setHistory([]);
    await supabase.from('product_scans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  };

  const startCamera = useCallback(async () => {
    setState((s) => ({ ...s, error: undefined }));
    if (!navigator.mediaDevices?.getUserMedia) {
      setState({
        status: 'result',
        verdict: 'unknown',
        error: 'متصفحك لا يدعم الكاميرا. استخدم البحث بالاسم أو رفع صورة. الكاميرا تتطلب اتصالاً آمناً (https).',
      });
      return;
    }
    const tryGetCamera = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        if ((err as Error).name === 'OverconstrainedError') {
          return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
        throw err;
      }
    };
    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await tryGetCamera({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch (err) {
        const name = (err as Error).name;
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          throw new Error('رفضت إذن الكاميرا. فعّل الإذن من إعدادات المتصفح ثم حاول مرة أخرى.');
        }
        if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          throw new Error('لا توجد كاميرا على هذا الجهاز. استخدم رفع صورة أو البحث بالاسم.');
        }
        if (name === 'NotReadableError') {
          throw new Error('الكاميرا مستخدمة بواسطة تطبيق آخر. أغلق التطبيقات الأخرى ثم حاول مرة أخرى.');
        }
        throw err;
      }
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      setState({
        status: 'result',
        verdict: 'unknown',
        error: err instanceof Error ? err.message : 'تعذّر الوصول إلى الكاميرا.',
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;
    const video = videoRef.current;
    video.srcObject = stream;
    video.play().catch(() => {});
  }, [stream, cameraActive]);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    analyzeImage(dataUrl);
  }, [stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData: string) => {
    setState({ status: 'scanning', capturedImage: imageData });
    try {
      const r: ProductResult = await analyzeProduct(imageData);
      setState({
        status: 'result',
        source: r.source,
        verdict: toVerdict(r.status),
        brand: r.brand,
        parentCompany: r.parentCompany,
        country: r.country,
        reason: r.reason,
        alternatives: r.alternatives,
        capturedImage: imageData,
      });
      saveScan({
        status: 'result',
        source: r.source,
        verdict: toVerdict(r.status),
        brand: r.brand,
        parentCompany: r.parentCompany,
        country: r.country,
        reason: r.reason,
        alternatives: r.alternatives,
        capturedImage: imageData,
      });
    } catch (err) {
      setState({
        status: 'result',
        verdict: 'unknown',
        capturedImage: imageData,
        error: err instanceof Error ? err.message : 'حدث خطأ غير متوقع',
      });
    }
  };

  const searchByBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const q = brandQuery.trim();
    if (!q) return;
    const local = findLocalProduct(q);
    if (local) {
      const localState: ScanState = {
        status: 'result',
        source: 'local_db',
        verdict: toVerdict(local.status),
        brand: local.brand,
        parentCompany: local.parentCompany,
        country: local.country,
        reason: local.reason,
        alternatives: local.alternatives,
      };
      setState(localState);
      saveScan(localState);
    } else {
      setState({
        status: 'result',
        verdict: 'unknown',
        brand: q,
        error: `المنتج "${q}" غير موجود في قاعدة البيانات المحلية. حاول تصويره بالكاميرا لتحليله بالذكاء الاصطناعي.`,
      });
    }
  };

  const reset = () => {
    setState({ status: 'idle' });
    setBrandQuery('');
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const info = state.verdict ? verdictInfo[state.verdict] : null;
  const ResultIcon = info?.icon;
  const hasAlternatives = !!state.alternatives && state.alternatives.length > 0;
  const isBoycott = state.verdict === 'boycott';

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-500 to-sky-400 items-center justify-center shadow-lg shadow-navy-500/30 mb-4 glow-blue">
          <ScanLine className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">فحص المنتجات</h1>
        <p className="text-slate-400">صوّر المنتج، ارفع صورته، أو ابحث بالاسم — ونجمة تخبرك بموقفه من المقاطعة والبدائل</p>
      </div>

      {state.error && !state.capturedImage && (
        <div className="glass border-rose-500/30 rounded-2xl p-4 mb-5 flex items-start gap-3 animate-slide-up">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-rose-300 text-sm">{state.error}</p>
        </div>
      )}

      <div className="glass rounded-3xl p-5 mb-6">
        <div className="relative aspect-square w-full bg-navy-900 rounded-2xl overflow-hidden flex items-center justify-center">
          {state.status === 'idle' && !cameraActive && (
            <div className="text-center p-6">
              <div className="inline-flex w-20 h-20 rounded-full bg-navy-800 items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-sky-300" />
              </div>
              <p className="text-sky-100 font-medium mb-1">الكاميرا متوقفة</p>
              <p className="text-slate-500 text-sm">اضغط لفتح الكاميرا، ارفع صورة، أو ابحث بالاسم</p>
            </div>
          )}

          {cameraActive && (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-navy-900/40 pointer-events-none">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-sky-300 animate-spin mx-auto mb-2" />
                  <p className="text-sky-100 text-xs">جارٍ تشغيل الكاميرا...</p>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-sky-300/80 rounded-2xl">
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-lg" />
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-lg" />
                </div>
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sky-200 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
                    مباشر
                  </span>
                </div>
              </div>
            </>
          )}

          {state.status === 'scanning' && state.capturedImage && (
            <div className="relative w-full h-full">
              <img src={state.capturedImage} alt="منتج قيد الفحص" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
                {/* Skeleton shimmer overlay */}
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent animate-marquee" />
                <div className="w-14 h-14 rounded-2xl bg-white/10 animate-pulse mb-3" />
                <Loader2 className="w-10 h-10 text-sky-300 animate-spin mb-3" />
                <p className="text-white font-medium">نجمة تحلّل الصورة...</p>
                <p className="text-slate-300 text-xs mt-1">يتم البحث في القاعدة المحلية ثم الذكاء الاصطناعي</p>
              </div>
            </div>
          )}

          {state.status === 'result' && state.capturedImage && (
            <div className="relative w-full h-full group">
              <img src={state.capturedImage} alt="المنتج المفحوص" className="w-full h-full object-cover" />
              {ResultIcon && info && (
                <div className={`absolute top-3 right-3 ${info.bg} ${info.color} rounded-full p-2 shadow-lg`}>
                  <ResultIcon className="w-5 h-5" />
                </div>
              )}
              <button
                onClick={reset}
                className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-5 space-y-3">
          {/* Brand name search (uses offline DB) */}
          {state.status === 'idle' && !cameraActive && (
            <form onSubmit={searchByBrand} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={brandQuery}
                  onChange={(e) => setBrandQuery(e.target.value)}
                  placeholder="ابحث بالاسم (مثال: كوكاكولا، المراعي)..."
                  className="w-full bg-ink-900/60 border border-white/10 rounded-2xl pr-9 pl-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!brandQuery.trim()}
                className="inline-flex items-center justify-center gap-1.5 bg-white/5 text-slate-100 font-bold px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                بحث
              </button>
            </form>
          )}

          {state.status === 'idle' && !cameraActive && (
            <>
              <button
                onClick={startCamera}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold px-6 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-navy-500/30 transition-all"
              >
                <Camera className="w-5 h-5" />
                فتح الكاميرا
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 bg-white/5 text-slate-100 font-bold px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
                رفع صورة من الجهاز
              </button>
            </>
          )}

          {cameraActive && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={stopCamera}
                className="inline-flex items-center justify-center gap-2 bg-white/5 text-slate-100 font-bold px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-colors"
              >
                <CameraOff className="w-5 h-5" />
                إيقاف
              </button>
              <button
                onClick={capture}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-sky-500 to-navy-600 text-white font-bold px-6 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-sky-500/30 transition-all"
              >
                <Camera className="w-5 h-5" />
                التقاط الصورة
              </button>
            </div>
          )}

          {state.status === 'result' && (
            <button
              onClick={reset}
              className="w-full inline-flex items-center justify-center gap-2 bg-white/5 text-slate-100 font-bold px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              فحص منتج آخر
            </button>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      </div>

      {/* Result card + alternatives + report button */}
      {state.status === 'result' && info && ResultIcon && (
        <div className="animate-slide-up space-y-4">
          {state.error ? (
            <div className="rounded-3xl p-6 border-2 bg-rose-500/10 border-rose-500/30 shadow-xl shadow-rose-500/20">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-300 flex items-center justify-center border border-rose-500/30 flex-shrink-0">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-rose-300 mb-1">تعذّر الفحص</p>
                  <p className="text-slate-400 text-sm">{state.error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-3xl p-6 border-2 ${info.bg} ${info.border} shadow-xl ${info.ring}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl ${info.bg} ${info.color} flex items-center justify-center border ${info.border} flex-shrink-0`}>
                  <ResultIcon className="w-7 h-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-2xl font-extrabold ${info.color} mb-1`}>{info.label}</p>
                  {state.brand && (
                    <p className="text-slate-300 font-semibold text-sm mb-1">
                      اسم المنتج / العلامة: <span className="text-white">{state.brand}</span>
                    </p>
                  )}
                  {state.source === 'local_db' && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-300/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Sparkles className="w-3 h-3" /> نتيجة فورية من القاعدة المحلية
                    </span>
                  )}
                  {state.source === 'gemini' && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-sky-300/80 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                      <Sparkles className="w-3 h-3" /> نتيجة من الذكاء الاصطناعي
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm border-t border-white/10 pt-4">
                {state.parentCompany && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-400 flex-shrink-0">الشركة الأم وجنسيتها:</span>
                    <span className="text-slate-200 font-medium">{state.parentCompany}</span>
                  </div>
                )}
                {state.country && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-400 flex-shrink-0">بلد المنشأ:</span>
                    <span className="text-slate-200 font-medium">{state.country}</span>
                  </div>
                )}
                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">التوضيح والسبب:</span>
                  <p className="text-slate-200 leading-relaxed">{state.reason ?? info.desc}</p>
                </div>
              </div>
            </div>
          )}

          {/* Alternatives section — only for boycotted products */}
          {isBoycott && !state.error && (() => {
            const cat = detectCategory(state.brand ?? '');
            const alts = getCountryCategoryAlternatives(country, cat);
            return (
            <div className="rounded-3xl p-6 border border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-emerald-300">بدائل محلية في {country}</h3>
                  <p className="text-slate-400 text-xs">
                    {cat === 'general'
                      ? 'بدائل عربية/محلية بديلة للمنتج المقاطَع'
                      : `${categoryLabel(cat)} — بدائل غير مقاطَعة من بلدك`}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {alts.map((alt, i) => (
                  <div
                    key={`${alt}-${i}`}
                    className="flex items-center gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-3 animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-slate-100 text-sm font-medium">{alt}</span>
                  </div>
                ))}
              </div>

              {hasAlternatives && (
                <div className="mt-5 pt-4 border-t border-emerald-500/20">
                  <p className="text-xs text-slate-400 mb-2">بدائل إضافية مقترحة:</p>
                  <div className="flex flex-wrap gap-2">
                    {state.alternatives!.map((alt, i) => (
                      <span
                        key={`alt-${i}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-200"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-300" />
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {/* Report error button */}
          {!state.error && (
            <button
              onClick={() => setReportOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 text-slate-400 hover:text-amber-300 font-medium py-2.5 rounded-2xl hover:bg-white/5 transition-colors text-sm"
            >
              <Flag className="w-4 h-4" />
              إبلاغ عن خطأ في النتيجة
            </button>
          )}
        </div>
      )}

      {state.status === 'idle' && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm mb-1">كيف يعمل؟</p>
              <p className="text-slate-300 text-sm leading-relaxed">
                صوّر منتجاً واضحاً، ارفع صورته، أو ابحث بالاسم. نجمة تبحث أولاً في قاعدة بيانات
                محلية لأكثر من 100 منتج شائع بسرعة دون إنترنت، فإن لم تجده يحلّله الذكاء
                الاصطناعي لتخبرك إن كان مقاطَعاً، غير مدرج، أو محلياً، مع اسم الشركة الأم
                والبدائل.
              </p>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                ملاحظة: الكاميرا تتطلب اتصالاً آمناً (https) وإذناً من المتصفح.
                إذا تعذّر فتحها، استخدم رفع صورة أو البحث بالاسم.
              </p>
            </div>
          </div>
        </div>
      )}

      {user && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-sky-300" />
              <h2 className="text-lg font-bold text-white">سجل الفحوصات</h2>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-slate-400 hover:text-rose-300 transition-colors"
              >
                مسح الكل
              </button>
            )}
          </div>

          {historyLoading ? (
            <div className="glass rounded-2xl p-6 text-center">
              <Loader2 className="w-5 h-5 text-sky-300 animate-spin mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center text-slate-500 text-sm">
              لا توجد فحوصات سابقة بعد
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => {
                const v = item.verdict as Verdict | null;
                const info = v ? verdictInfo[v] : null;
                const Icon = info?.icon;
                return (
                  <div
                    key={item.id}
                    className="glass rounded-2xl p-4 flex items-start gap-3 group hover:bg-white/[0.07] transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-xl ${info ? `${info.bg} ${info.color}` : 'bg-navy-500/15 text-sky-300'} flex items-center justify-center flex-shrink-0`}>
                      {Icon ? <Icon className="w-4 h-4" /> : <ScanLine className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-100 text-sm font-medium truncate">
                        {item.brand ?? 'منتج غير محدد'}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        {info && (
                          <span className={info.color}>{info.label}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString('ar-EG', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-300 transition-all flex-shrink-0"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ReportModal
        open={reportOpen}
        brand={state.brand ?? ''}
        currentStatus={state.verdict}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
