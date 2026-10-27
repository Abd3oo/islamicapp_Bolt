import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, CheckCircle2, AlertTriangle, XCircle, BookOpen, Info, Sparkles, RotateCcw, AlertCircle, History, Trash2, Clock } from 'lucide-react';
import { verifyHadith, type HadithResult } from '../lib/gemini';
import { supabase } from '../lib/gemini';
import { useAuth } from '../lib/auth';

type ApiStatus = 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'unknown';

interface UiResult {
  status: ApiStatus;
  statusLabel: string;
  source: string;
  narrator: string;
  explanation: string;
}

type State =
  | { kind: 'empty' }
  | { kind: 'loading' }
  | { kind: 'found'; data: UiResult }
  | { kind: 'error'; message: string };

const statusStyles: Record<ApiStatus, { bg: string; text: string; border: string; ring: string; icon: typeof CheckCircle2 }> = {
  sahih: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30', ring: 'shadow-emerald-500/20', icon: CheckCircle2 },
  hasan: { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/30', ring: 'shadow-sky-500/20', icon: Sparkles },
  daif: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30', ring: 'shadow-amber-500/20', icon: AlertTriangle },
  mawdu: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30', ring: 'shadow-rose-500/20', icon: XCircle },
  unknown: { bg: 'bg-navy-500/10', text: 'text-sky-300', border: 'border-white/15', ring: 'shadow-navy-500/20', icon: AlertCircle },
};

function mapStatus(raw: string): { status: ApiStatus; label: string } {
  const s = raw.trim().toLowerCase();
  if (s.includes('صحيح')) return { status: 'sahih', label: 'صحيح' };
  if (s.includes('حسن')) return { status: 'hasan', label: 'حسن' };
  if (s.includes('ضعيف')) return { status: 'daif', label: 'ضعيف' };
  if (s.includes('موضوع')) return { status: 'mawdu', label: 'موضوع' };
  if (s.includes('لا أصل')) return { status: 'mawdu', label: 'لا أصل له' };
  return { status: 'unknown', label: raw || 'غير معروف' };
}

export default function Hadith() {
  const [input, setInput] = useState('');
  const [state, setState] = useState<State>({ kind: 'empty' });
  const { user } = useAuth();
  const [history, setHistory] = useState<HadithHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  interface HadithHistoryItem {
    id: string;
    hadith_text: string;
    status_label: string | null;
    source: string | null;
    created_at: string;
  }

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('hadith_scans')
        .select('id, hadith_text, status_label, source, created_at')
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

  const handleSearch = async () => {
    const text = input.trim();
    if (!text) return;
    setState({ kind: 'loading' });
    try {
      const r: HadithResult = await verifyHadith(text);
      const { status, label } = mapStatus(r.status ?? '');
      setState({
        kind: 'found',
        data: {
          status,
          statusLabel: label,
          source: r.source ?? 'غير محدد',
          narrator: r.narrator ?? '',
          explanation: r.explanation ?? '',
        },
      });
      if (user) {
        await supabase.from('hadith_scans').insert({
          hadith_text: text,
          status: r.status ?? '',
          status_label: label,
          source: r.source ?? '',
          narrator: r.narrator ?? '',
          explanation: r.explanation ?? '',
        });
        loadHistory();
      }
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'حدث خطأ غير متوقع' });
    }
  };

  const deleteHistoryItem = async (id: string) => {
    setHistory((h) => h.filter((x) => x.id !== id));
    await supabase.from('hadith_scans').delete().eq('id', id);
  };

  const clearHistory = async () => {
    setHistory([]);
    await supabase.from('hadith_scans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  };

  const handleReset = () => {
    setInput('');
    setState({ kind: 'empty' });
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-500 to-sky-400 items-center justify-center shadow-lg shadow-navy-500/30 mb-4 glow-blue">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">فحص الأحاديث</h1>
        <p className="text-slate-400">اكتب الحديث ونجمة تخبرك بصحته وضعفه مع المصدر والشرح</p>
      </div>

      {/* Search box */}
      <div className="glass rounded-3xl p-5 sm:p-6 mb-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب الحديث هنا... مثال: إنما الأعمال بالنيات"
          rows={3}
          className="w-full bg-ink-900/60 border border-white/10 rounded-2xl px-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all resize-none font-arabic text-lg"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSearch();
          }}
        />
        <div className="flex items-center justify-between mt-4 gap-3">
          <p className="text-xs text-slate-500 hidden sm:block">اضغط Ctrl + Enter للبحث</p>
          <div className="flex gap-2 sm:ml-auto">
            {input && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-medium px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                مسح
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={!input.trim() || state.kind === 'loading'}
              className="inline-flex items-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-navy-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {state.kind === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {state.kind === 'loading' ? 'جاري البحث...' : 'فحص الحديث'}
            </button>
          </div>
        </div>
      </div>

      {state.kind === 'loading' && (
        <div className="glass rounded-3xl p-8 text-center animate-slide-up">
          <div className="inline-flex w-16 h-16 rounded-full bg-navy-500/10 items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-sky-300 animate-spin" />
          </div>
          <p className="text-slate-300 font-medium">نجمة تبحث في المراجع...</p>
        </div>
      )}

      {state.kind === 'found' && <FoundView data={state.data} onReset={handleReset} />}

      {state.kind === 'error' && <ErrorView message={state.message} onReset={handleReset} />}

      {state.kind === 'empty' && (
        <div className="glass rounded-3xl p-8 text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-white/5 items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-300 font-medium mb-1">ابدأ بكتابة حديث</p>
          <p className="text-slate-500 text-sm">ستظهر النتيجة هنا بعد الفحص</p>
        </div>
      )}

      {user && (
        <HistorySection
          history={history}
          loading={historyLoading}
          onDelete={deleteHistoryItem}
          onClear={clearHistory}
        />
      )}
    </div>
  );
}

function HistorySection({
  history,
  loading,
  onDelete,
  onClear,
}: {
  history: HadithHistoryItem[];
  loading: boolean;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-sky-300" />
          <h2 className="text-lg font-bold text-white">سجل الفحوصات</h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-rose-300 transition-colors"
          >
            مسح الكل
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-6 text-center">
          <Loader2 className="w-5 h-5 text-sky-300 animate-spin mx-auto" />
        </div>
      ) : history.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-center text-slate-500 text-sm">
          لا توجد فحوصات سابقة بعد
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="glass rounded-2xl p-4 flex items-start gap-3 group hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-navy-500/15 text-sky-300 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-100 text-sm line-clamp-2 leading-relaxed">
                  {item.hadith_text}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  {item.status_label && (
                    <span className="text-sky-300 font-medium">{item.status_label}</span>
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
                onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-300 transition-all flex-shrink-0"
                aria-label="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FoundView({ data, onReset }: { data: UiResult; onReset: () => void }) {
  const style = statusStyles[data.status];
  const Icon = style.icon;
  return (
    <div className="animate-slide-up space-y-4">
      <div className={`rounded-3xl p-6 border-2 ${style.bg} ${style.border} shadow-xl ${style.ring}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center border ${style.border}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <p className={`text-2xl font-extrabold ${style.text}`}>{data.statusLabel}</p>
            <p className="text-slate-400 text-sm mt-0.5">{data.source}</p>
          </div>
        </div>
      </div>

      {data.narrator && (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-3">
            <BookOpen className="w-4 h-4" />
            الراوي
          </div>
          <p className="text-slate-200">{data.narrator}</p>
        </div>
      )}

      {data.explanation && (
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-3">
            <Info className="w-4 h-4" />
            الشرح
          </div>
          <p className="text-slate-200 leading-relaxed">{data.explanation}</p>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white font-medium py-3 rounded-2xl hover:bg-white/5 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        فحص حديث آخر
      </button>
    </div>
  );
}

function ErrorView({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="animate-slide-up space-y-4">
      <div className="rounded-3xl p-6 border-2 bg-rose-500/10 border-rose-500/30 shadow-xl shadow-rose-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-300 flex items-center justify-center border border-rose-500/30">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-rose-300">تعذّر الفحص</p>
            <p className="text-slate-400 text-sm mt-0.5">{message}</p>
          </div>
        </div>
      </div>
      <button
        onClick={onReset}
        className="w-full inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white font-medium py-3 rounded-2xl hover:bg-white/5 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        المحاولة مرة أخرى
      </button>
    </div>
  );
}
