import { useState } from 'react';
import { Mail, Lock, UserPlus, Loader2, ArrowLeft, Eye, EyeOff, Star, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function SignUp({ onNavigate, onBack }: { onNavigate: () => void; onBack: () => void }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(email.trim(), password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="animate-fade-in min-h-[75vh] flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500/10 items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">تم إنشاء الحساب</h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.
          </p>
          <button
            onClick={onNavigate}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold px-6 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-navy-500/30 transition-all"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-[75vh] flex items-center justify-center px-4">
      <div className="glass-strong rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl">
        <div className="text-center mb-7">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 via-navy-500 to-navy-700 items-center justify-center shadow-lg shadow-navy-500/30 mb-4 glow-blue">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">إنشاء حساب</h1>
          <p className="text-slate-400 text-sm">أنشئ حساباً جديداً للوصول إلى جميع المزايا</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-ink-900/60 border border-white/10 rounded-2xl pr-9 pl-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                className="w-full bg-ink-900/60 border border-white/10 rounded-2xl pr-9 pl-11 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">تأكيد كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-ink-900/60 border border-white/10 rounded-2xl pr-9 pl-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all"
                dir="ltr"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 flex items-start gap-2">
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold px-6 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-navy-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            إنشاء الحساب
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            لديك حساب بالفعل؟{' '}
            <button onClick={onNavigate} className="text-sky-300 hover:text-sky-200 font-medium transition-colors">
              تسجيل الدخول
            </button>
          </p>
        </div>

        <button
          onClick={onBack}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm py-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
