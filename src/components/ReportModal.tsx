import { useState } from 'react';
import { X, Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitErrorReport } from '../lib/gemini';

interface ReportModalProps {
  open: boolean;
  brand: string;
  currentStatus?: string;
  onClose: () => void;
}

const statusOptions = [
  { value: 'boycott', label: 'مقاطعة' },
  { value: 'not_boycotted', label: 'غير مقاطعة / غير مدرج' },
  { value: 'local', label: 'منتج محلي' },
  { value: 'unknown', label: 'لم يتم التعرف' },
];

export default function ReportModal({ open, brand, currentStatus, onClose }: ReportModalProps) {
  const [correctStatus, setCorrectStatus] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('من فضلك اكتب تفاصيل الخطأ');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitErrorReport({
        brand: brand || 'غير محدد',
        currentStatus,
        correctStatus: correctStatus || undefined,
        message: message.trim(),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر إرسال البلاغ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCorrectStatus('');
    setMessage('');
    setDone(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative glass-strong rounded-3xl p-6 sm:p-8 max-w-md w-full animate-slide-up shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="text-center py-6">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500/10 items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2">تم الإرسال</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              شكراً لك. وصل بلاغك وسنراجع المعلومة في أقرب وقت.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold px-6 py-3 rounded-2xl hover:shadow-lg hover:shadow-navy-500/30 transition-all"
            >
              حسناً
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-300 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">إبلاغ عن خطأ</h3>
                {brand && <p className="text-slate-400 text-xs">المنتج: {brand}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  الحالة الصحيحة (اختياري)
                </label>
                <select
                  value={correctStatus}
                  onChange={(e) => setCorrectStatus(e.target.value)}
                  className="w-full bg-ink-900/60 border border-white/10 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all"
                >
                  <option value="">اختر الحالة الصحيحة...</option>
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  تفاصيل الخطأ <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="مثال: الحالة غير صحيحة، أو البديل المقترح غير مناسب، أو الشركة الأم مختلفة..."
                  rows={4}
                  className="w-full bg-ink-900/60 border border-white/10 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all resize-none"
                />
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-rose-300 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold px-6 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-navy-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {submitting ? 'جارٍ الإرسال...' : 'إرسال البلاغ'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
