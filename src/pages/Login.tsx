import { useState } from 'react';
import { Mail, Lock, Loader2, LogIn, ArrowLeft, Eye, EyeOff, Star } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function Login({ onNavigate, onBack }: { onNavigate: () => void; onBack: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in min-h-[75vh] flex items-center justify-center px-4">
      <div className="glass-strong rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl">
        <div className="text-center mb-7">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 via-navy-500 to-navy-700 items-center justify-center shadow-lg shadow-navy-500/30 mb-4 glow-blue">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">تسجيل الدخول</h1>
          <p className="text-slate-400 text-sm">أدخل بياناتك للوصول إلى حسابك</p>
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
                placeholder="••••••••"
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
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            دخول
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            ليس لديك حساب؟{' '}
            <button onClick={onNavigate} className="text-sky-300 hover:text-sky-200 font-medium transition-colors">
              إنشاء حساب جديد
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
