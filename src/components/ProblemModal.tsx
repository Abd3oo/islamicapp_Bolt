import { useState } from 'react';
import { X, Loader2, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { submitIssueReport } from '../lib/gemini';

interface ProblemModalProps {
  open: boolean;
  page?: string;
  onClose: () => void;
}

export default function ProblemModal({ open, page, onClose }: ProblemModalProps) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('من فضلك اكتب تفاصيل المشكلة');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitIssueReport(message.trim(), page);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر إرسال البلاغ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
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
              شكراً لك. وصلنا بلاغك عن المشكلة وسنعمل على حلها في أقرب وقت.
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
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">الإبلاغ عن مشكلة</h3>
                <p className="text-slate-400 text-xs">صِف لنا المشكلة التي تواجهها وسنصلحها</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  تفاصيل المشكلة <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="مثال: الكاميرا لا تعمل، أو صفحة معينة لا تفتح، أو نتيجة خاطئة، أو أي مشكلة أخرى..."
                  rows={5}
                  className="w-full bg-ink-900/60 border border-white/10 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all resize-none"
                />
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-rose-300 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white/5 text-slate-200 font-bold px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold px-6 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-navy-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {submitting ? 'جارٍ الإرسال...' : 'إرسال'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
