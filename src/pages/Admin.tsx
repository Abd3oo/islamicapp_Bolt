import { useState, useEffect, useCallback } from 'react';
import {
  Shield, ShieldX, Lock, Loader2, AlertTriangle, Ban, Search, RefreshCw,
  Trash2, ArrowLeft, Activity, Eye, EyeOff, ChevronLeft, Users, MessageSquare, User,
} from 'lucide-react';
import {
  adminLogin, adminLogout, listBlockedIps, blockIp, unblockIp,
  listActivities, getStats, listUsers, listComplaints,
  type BlockedIp, type SuspiciousActivity, type AdminUser, type Complaint,
} from '../lib/admin';

const TOKEN_KEY = 'najma_admin_token';

type Tab = 'overview' | 'activities' | 'blacklist' | 'users' | 'complaints';

export default function Admin({ onExit }: { onExit: () => void }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>('overview');
  const [blocked, setBlocked] = useState<BlockedIp[]>([]);
  const [activities, setActivities] = useState<SuspiciousActivity[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({ blocked: 0, activities: 0, users: 0, complaints: 0 });
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchIp, setSearchIp] = useState('');

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setActionError(null);
    try {
      const [b, a, s, u, c] = await Promise.all([
        listBlockedIps(token), listActivities(token, 200, 0), getStats(token),
        listUsers(token), listComplaints(token, 200, 0),
      ]);
      setBlocked(b);
      setActivities(a);
      setStats(s);
      setUsers(u);
      setComplaints(c);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل تحميل البيانات';
      if (msg.includes('غير مصرح') || msg.includes('401')) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      } else {
        setActionError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) refresh();
  }, [token, refresh]);

  // Auto-refresh every 5 seconds for near-realtime updates
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => refresh(), 5000);
    return () => clearInterval(interval);
  }, [token, refresh]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoginLoading(true);
    setLoginError(null);
    try {
      const { token: t } = await adminLogin(password);
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      setPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (token) adminLogout(token).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const handleBlock = async (ip: string, reason?: string) => {
    if (!token) return;
    setActionError(null);
    try {
      await blockIp(token, ip, reason);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'فشل الحظر');
    }
  };

  const handleUnblock = async (ip: string) => {
    if (!token) return;
    setActionError(null);
    try {
      await unblockIp(token, ip);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'فشل إلغاء الحظر');
    }
  };

  // ---- Login screen ----
  if (!token) {
    return (
      <div className="animate-fade-in min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl">
          <div className="text-center mb-7">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-500 to-sky-400 items-center justify-center shadow-lg shadow-navy-500/30 mb-4 glow-blue">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">لوحة تحكم الأدمن</h1>
            <p className="text-slate-400 text-sm">أدخل كلمة المرور للوصول إلى لوحة الأمن</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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

            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-rose-300 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading || !password.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold px-6 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-navy-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
              دخول
            </button>
          </form>

          <button
            onClick={onExit}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm py-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للموقع
          </button>
        </div>
      </div>
    );
  }

  // ---- Dashboard ----
  const filteredActivities = searchIp.trim()
    ? activities.filter((a) => a.ip.includes(searchIp.trim()))
    : activities;

  const filteredBlocked = searchIp.trim()
    ? blocked.filter((b) => b.ip.includes(searchIp.trim()))
    : blocked;

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-navy-500 to-sky-400 flex items-center justify-center shadow-lg shadow-navy-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">لوحة الأمن والحظر</h1>
            <p className="text-slate-400 text-xs">إدارة حماية الموقع وعناوين IP</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 glass text-slate-200 font-medium px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-300 border border-rose-500/30 font-medium px-3 py-2 rounded-xl hover:bg-rose-500/20 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            خروج
          </button>
        </div>
      </div>

      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 mb-5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-rose-300 text-sm">{actionError}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-2xl p-1 mb-6 w-fit max-w-full overflow-x-auto">
        {([
          { id: 'overview', label: 'نظرة عامة', icon: Activity },
          { id: 'activities', label: 'أنشطة مشبوهة', icon: AlertTriangle },
          { id: 'blacklist', label: 'قائمة الحظر', icon: Ban },
          { id: 'users', label: 'المستخدمون', icon: Users },
          { id: 'complaints', label: 'الشكاوى', icon: MessageSquare },
        ] as { id: Tab; label: string; icon: typeof Activity }[]).map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                active ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && (
                <span className="absolute inset-0 bg-gradient-to-br from-navy-500 to-navy-700 rounded-xl shadow-lg shadow-navy-500/40" />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10 hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search bar (for non-overview tabs) */}
      {tab !== 'overview' && (
        <div className="relative mb-5 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchIp}
            onChange={(e) => setSearchIp(e.target.value)}
            placeholder={tab === 'users' ? 'بحث بالإيميل...' : tab === 'complaints' ? 'بحث في الشكاوى...' : 'بحث بعنوان IP...'}
            className="w-full bg-ink-900/60 border border-white/10 rounded-2xl pr-9 pl-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all text-sm"
            dir="ltr"
          />
        </div>
      )}

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-300 flex items-center justify-center border border-rose-500/30">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">عناوين IP المحظورة</p>
                <p className="text-3xl font-extrabold text-white">{stats.blocked}</p>
              </div>
            </div>
            <button
              onClick={() => setTab('blacklist')}
              className="text-rose-300 hover:text-rose-200 text-sm font-medium transition-colors"
            >
              عرض القائمة ←
            </button>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-300 flex items-center justify-center border border-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">الأنشطة المشبوهة</p>
                <p className="text-3xl font-extrabold text-white">{stats.activities}</p>
              </div>
            </div>
            <button
              onClick={() => setTab('activities')}
              className="text-amber-300 hover:text-amber-200 text-sm font-medium transition-colors"
            >
              عرض السجل ←
            </button>
          </div>
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-300 flex items-center justify-center border border-sky-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">المستخدمون المسجلون</p>
                <p className="text-3xl font-extrabold text-white">{stats.users}</p>
              </div>
            </div>
            <button
              onClick={() => setTab('users')}
              className="text-sky-300 hover:text-sky-200 text-sm font-medium transition-colors"
            >
              عرض القائمة ←
            </button>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">الشكاوى والبلاغات</p>
                <p className="text-3xl font-extrabold text-white">{stats.complaints}</p>
              </div>
            </div>
            <button
              onClick={() => setTab('complaints')}
              className="text-emerald-300 hover:text-emerald-200 text-sm font-medium transition-colors"
            >
              عرض الشكاوى ←
            </button>
          </div>
        </div>
      )}

      {/* Activities tab */}
      {tab === 'activities' && (
        <div className="glass rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="text-right py-3 px-4 font-medium">عنوان IP</th>
                  <th className="text-right py-3 px-4 font-medium">النوع</th>
                  <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">التفاصيل</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">التاريخ</th>
                  <th className="text-center py-3 px-4 font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500">
                      {loading ? 'جارٍ التحميل...' : 'لا توجد أنشطة مشبوهة'}
                    </td>
                  </tr>
                )}
                {filteredActivities.map((a) => (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-slate-200 font-mono" dir="ltr">{a.ip}</td>
                    <td className="py-3 px-4">
                      <ActivityBadge type={a.type} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 hidden sm:table-cell max-w-xs truncate" title={a.detail ?? ''}>
                      {a.detail ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 hidden md:table-cell whitespace-nowrap">
                      {new Date(a.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleBlock(a.ip, a.type)}
                        className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 transition-colors text-xs font-medium"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        حظر
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blacklist tab */}
      {tab === 'blacklist' && (
        <div className="space-y-5">
          <div className="glass rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="text-right py-3 px-4 font-medium">عنوان IP</th>
                    <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">السبب</th>
                    <th className="text-right py-3 px-4 font-medium hidden md:table-cell">تاريخ الحظر</th>
                    <th className="text-center py-3 px-4 font-medium">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlocked.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-500">
                        {loading ? 'جارٍ التحميل...' : 'لا توجد عناوين محظورة'}
                      </td>
                    </tr>
                  )}
                  {filteredBlocked.map((b) => (
                    <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-slate-200 font-mono" dir="ltr">{b.ip}</td>
                      <td className="py-3 px-4 text-slate-400 hidden sm:table-cell max-w-xs truncate" title={b.reason ?? ''}>
                        {b.reason ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 hidden md:table-cell whitespace-nowrap">
                        {new Date(b.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleUnblock(b.ip)}
                          className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors text-xs font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          إلغاء الحظر
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manual block form */}
          <ManualBlockForm onBlock={handleBlock} />
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="glass rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="text-right py-3 px-4 font-medium">البريد الإلكتروني</th>
                  <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">تاريخ التسجيل</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">آخر دخول</th>
                </tr>
              </thead>
              <tbody>
                {users.filter((u) => !searchIp.trim() || u.email.includes(searchIp.trim())).length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-slate-500">
                      {loading ? 'جارٍ التحميل...' : 'لا يوجد مستخدمون مسجلون'}
                    </td>
                  </tr>
                )}
                {users
                  .filter((u) => !searchIp.trim() || u.email.includes(searchIp.trim()))
                  .map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-300 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-slate-200" dir="ltr">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 hidden sm:table-cell whitespace-nowrap">
                        {new Date(u.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 text-slate-400 hidden md:table-cell whitespace-nowrap">
                        {u.last_sign_in_at
                          ? new Date(u.last_sign_in_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complaints tab */}
      {tab === 'complaints' && (
        <div className="glass rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="text-right py-3 px-4 font-medium">نص الشكوى</th>
                  <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">إيميل المرسل</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">الصفحة</th>
                  <th className="text-right py-3 px-4 font-medium hidden md:table-cell">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {complaints
                  .filter((c) => !searchIp.trim() || (c.message?.includes(searchIp.trim()) || c.email?.includes(searchIp.trim())))
                  .length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-500">
                      {loading ? 'جارٍ التحميل...' : 'لا توجد شكاوى'}
                    </td>
                  </tr>
                )}
                {complaints
                  .filter((c) => !searchIp.trim() || (c.message?.includes(searchIp.trim()) || c.email?.includes(searchIp.trim())))
                  .map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-slate-200 max-w-md">
                        <p className="line-clamp-2" title={c.message}>{c.message}</p>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        {c.email ? (
                          <span className="text-sky-300" dir="ltr">{c.email}</span>
                        ) : (
                          <span className="text-slate-500">زائر</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                        {c.page ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 hidden md:table-cell whitespace-nowrap">
                        {new Date(c.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    sql_injection_attempt: { label: 'SQL Injection', color: 'text-rose-300', bg: 'bg-rose-500/10 border-rose-500/30' },
    xss_attempt: { label: 'XSS', color: 'text-rose-300', bg: 'bg-rose-500/10 border-rose-500/30' },
    failed_admin_login: { label: 'دخول أدمن خاطئ', color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/30' },
    blocked_access_attempt: { label: 'وصول محظور', color: 'text-rose-300', bg: 'bg-rose-500/10 border-rose-500/30' },
  };
  const info = map[type] ?? { label: type, color: 'text-slate-300', bg: 'bg-white/5 border-white/10' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border ${info.bg} ${info.color} text-xs font-medium`}>
      {info.label}
    </span>
  );
}

function ManualBlockForm({ onBlock }: { onBlock: (ip: string, reason?: string) => void }) {
  const [ip, setIp] = useState('');
  const [reason, setReason] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip.trim()) return;
    onBlock(ip.trim(), reason.trim() || undefined);
    setIp('');
    setReason('');
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldX className="w-5 h-5 text-rose-300" />
        <h3 className="font-bold text-white">حظر عنوان IP يدوياً</h3>
      </div>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="192.168.1.1"
          className="flex-1 bg-ink-900/60 border border-white/10 rounded-2xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all text-sm"
          dir="ltr"
        />
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="السبب (اختياري)"
          className="flex-1 bg-ink-900/60 border border-white/10 rounded-2xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-400/60 focus:border-transparent transition-all text-sm"
        />
        <button
          type="submit"
          disabled={!ip.trim()}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-rose-500 to-rose-700 text-white font-bold px-5 py-2.5 rounded-2xl hover:shadow-lg hover:shadow-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Ban className="w-4 h-4" />
          حظر
        </button>
      </form>
    </div>
  );
}
