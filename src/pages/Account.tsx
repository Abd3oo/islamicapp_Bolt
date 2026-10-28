import { useState } from 'react';
import {
  Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2, User, LogOut,
  ArrowLeft, KeyRound, ShieldCheck, Calendar,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/gemini';

export default function Account({ onBack }: { onBack: () => void }) {
  const { user, signOut } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="animate-fade-in min-h-[60vh] flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-8 max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-sky-300" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">يجب تسجيل الدخول</h1>
          <p className="text-slate-400 text-sm mb-5">سجّل دخولك للوصول إلى إعدادات حسابك.</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-medium px-5 py-2.5 rounded-2xl transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw new Error(updateError.message);
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        العودة للرئيسية
      </button>

      {/* Profile card */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 via-navy-500 to-navy-700 flex items-center justify-center shadow-lg shadow-navy-500/30 flex-shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-white mb-1">حسابي</h1>
            <p className="text-slate-400 text-sm">إدارة بياناتك وكلمة المرور</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
            <Mail className="w-5 h-5 text-sky-300 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-slate-400 text-xs">البريد الإلكتروني</p>
              <p className="text-slate-100 text-sm font-medium truncate" dir="ltr">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
            <Calendar className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            <div>
              <p className="text-slate-400 text-xs">تاريخ إنشاء الحساب</p>
              <p className="text-slate-100 text-sm font-medium">{createdAt}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-rose-500/10 text-rose-300 border border-rose-500/30 font-medium px-5 py-3 rounded-2xl hover:bg-rose-500/20 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>

      {/* Change password card */}
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-300 flex items-center justify-center border border-amber-500/30">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white">تغيير كلمة المرور</h2>
            <p className="text-slate-400 text-xs">اختر كلمة مرور قوية لا تقل عن 6 أحرف</p>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 mb-4 flex items-start gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-300 text-sm">تم تغيير كلمة المرور بنجاح.</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 mb-4 flex items-start gap-2">
            <p className="text-rose-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">كلمة المرور الجديدة</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-ink-900/60 border border-white/10 rounded-2xl pr-9 pl-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold px-6 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-navy-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
            تحديث كلمة المرور
          </button>
        </form>
      </div>

      {/* Security tip */}
      <div className="glass rounded-2xl p-4 mt-5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-300 text-xs leading-relaxed">
          نصيحة: استخدم كلمة مرور فريدة لا تستخدمها في مواقع أخرى. يمكنك تغييرها في أي وقت من هذه الصفحة.
        </p>
      </div>
    </div>
  );
}
