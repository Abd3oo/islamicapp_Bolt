import { useState, useEffect } from 'react';
import { Star, BookOpen, ScanLine, Home, AlertTriangle, Shield, LogIn, LogOut, User } from 'lucide-react';
import ProblemModal from './ProblemModal';
import { useAuth } from '../lib/auth';

export type Page = 'home' | 'hadith' | 'scanner' | 'admin' | 'login' | 'signup';

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

const navItems: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'hadith', label: 'فحص الأحاديث', icon: BookOpen },
  { id: 'scanner', label: 'فحص المنتجات', icon: ScanLine },
];

const stars = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  top: `${(i * 37) % 100}%`,
  left: `${(i * 53) % 100}%`,
  size: i % 4 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1',
  delay: `${(i % 5) * 0.6}s`,
}));

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [problemOpen, setProblemOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-950 text-slate-100">
      {/* Animated aurora background */}
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <div className="absolute -top-40 -right-32 w-[55vw] h-[55vw] bg-navy-600/25 rounded-full blur-[120px] animate-aurora" />
        <div className="absolute top-1/3 -left-32 w-[50vw] h-[50vw] bg-sky-500/20 rounded-full blur-[120px] animate-aurora" style={{ animationDelay: '4s' }} />
        <div className="absolute -bottom-40 right-1/4 w-[45vw] h-[45vw] bg-navy-500/15 rounded-full blur-[120px] animate-aurora" style={{ animationDelay: '8s' }} />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 -z-10 bg-grid-pattern [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-60" />

      {/* Twinkling stars */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {stars.map((s) => (
          <span
            key={s.id}
            className={`absolute ${s.size} rounded-full bg-white animate-twinkle`}
            style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          />
        ))}
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-strong shadow-2xl shadow-black/40' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 group"
            >
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-400 via-navy-500 to-navy-700 flex items-center justify-center shadow-lg shadow-navy-500/40 group-hover:scale-110 transition-transform glow-blue">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-300 rounded-full animate-pulse" />
              </div>
              <div className="text-right">
                <h1 className="text-lg sm:text-xl font-extrabold text-white leading-none">نجمة</h1>
                <p className="text-[10px] sm:text-xs text-sky-300/70 mt-0.5">المرجع الديني الذكي</p>
              </div>
            </button>

            <nav className="flex items-center gap-1 glass rounded-2xl p-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      active ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-0 bg-gradient-to-br from-navy-500 to-navy-700 rounded-xl shadow-lg shadow-navy-500/40" />
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setProblemOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-all"
                aria-label="أبلغ عن مشكلة"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">مشكلة</span>
              </button>
            </nav>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-sky-300 text-sm font-medium px-2">
                  <User className="w-4 h-4" />
                  <span className="max-w-[140px] truncate" dir="ltr">{user.email}</span>
                </span>
                <button
                  onClick={() => signOut()}
                  title="تسجيل الخروج"
                  className="inline-flex items-center gap-2 glass text-slate-300 hover:text-rose-300 font-medium px-3 py-2 rounded-2xl hover:bg-white/10 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-2 bg-gradient-to-br from-sky-500 to-navy-600 text-white font-medium px-3.5 py-2 rounded-2xl hover:shadow-lg hover:shadow-navy-500/30 transition-all text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>
            )}

            {user?.email === 'abdelrhmanofficial11@gmail.com' && (
              <button
                onClick={() => onNavigate('admin')}
                title="لوحة الأمن"
                className="inline-flex items-center justify-center glass text-slate-300 hover:text-sky-300 w-9 h-9 rounded-2xl hover:bg-white/10 transition-colors"
                aria-label="لوحة الأمن"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>

      <footer className="relative border-t border-white/5 mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-sm text-slate-400">
            نجمة · المرجع الديني الذكي · {new Date().getFullYear()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            يُنصح دائماً بالرجوع لأهل العلم للتحقق
          </p>
        </div>
      </footer>

      <ProblemModal open={problemOpen} page={currentPage} onClose={() => setProblemOpen(false)} />
    </div>
  );
}
