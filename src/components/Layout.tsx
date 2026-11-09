import { useState, useEffect } from 'react';
import { Star, BookOpen, ScanLine, Home, AlertTriangle, Shield, LogIn, LogOut, User, MapPin, ChevronDown, UserCircle, Menu, X } from 'lucide-react';
import ProblemModal from './ProblemModal';
import { useAuth } from '../lib/auth';
import { COUNTRIES, type Country } from '../lib/alternatives';

export type Page = 'home' | 'hadith' | 'scanner' | 'admin' | 'login' | 'signup' | 'account';

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  country: Country;
  onCountryChange: (c: Country) => void;
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

export default function Layout({ currentPage, onNavigate, country, onCountryChange, children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [problemOpen, setProblemOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <div className="flex items-center justify-between h-14 sm:h-18 gap-2">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-400 via-navy-500 to-navy-700 flex items-center justify-center shadow-lg shadow-navy-500/40 group-hover:scale-110 transition-transform glow-blue">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-sky-300 rounded-full animate-pulse" />
              </div>
              <div className="text-right">
                <h1 className="text-base sm:text-xl font-extrabold text-white leading-none">نجمة</h1>
                <p className="text-[9px] sm:text-xs text-sky-300/70 mt-0.5 hidden xs:block">المرجع الديني الذكي</p>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 glass rounded-2xl p-1">
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
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setProblemOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>مشكلة</span>
              </button>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Country selector */}
              <div className="relative">
                <button
                  onClick={() => setCountryOpen((v) => !v)}
                  className="inline-flex items-center gap-1 glass text-slate-200 hover:text-sky-300 font-medium px-2.5 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm"
                  aria-label="اختر دولتك"
                >
                  <MapPin className="w-4 h-4 text-sky-300 flex-shrink-0" />
                  <span className="hidden sm:inline max-w-[80px] truncate">{country}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                </button>
                {countryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCountryOpen(false)} />
                    <div className="absolute left-0 mt-2 w-44 max-h-64 overflow-y-auto glass-strong rounded-2xl shadow-2xl shadow-black/40 z-50 p-1.5">
                      {COUNTRIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            onCountryChange(c);
                            setCountryOpen(false);
                          }}
                          className={`w-full text-right px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                            c === country ? 'bg-gradient-to-br from-navy-500 to-navy-700 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 opacity-70" />
                          {c}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Auth (desktop) */}
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('account')}
                    title="حسابي"
                    className="inline-flex items-center justify-center glass text-slate-300 hover:text-sky-300 w-9 h-9 rounded-2xl hover:bg-white/10 transition-colors"
                    aria-label="حسابي"
                  >
                    <UserCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => signOut()}
                    title="تسجيل الخروج"
                    className="inline-flex items-center gap-2 glass text-slate-300 hover:text-rose-300 font-medium px-3 py-2 rounded-2xl hover:bg-white/10 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>خروج</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-br from-sky-500 to-navy-600 text-white font-medium px-3.5 py-2 rounded-2xl hover:shadow-lg hover:shadow-navy-500/30 transition-all text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>دخول</span>
                </button>
              )}

              {user?.email === 'abdelrhmanofficial11@gmail.com' && (
                <button
                  onClick={() => onNavigate('admin')}
                  title="لوحة الأمن"
                  className="hidden sm:inline-flex items-center justify-center glass text-slate-300 hover:text-sky-300 w-9 h-9 rounded-2xl hover:bg-white/10 transition-colors"
                  aria-label="لوحة الأمن"
                >
                  <Shield className="w-4 h-4" />
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden inline-flex items-center justify-center glass text-slate-200 w-9 h-9 rounded-xl hover:bg-white/10 transition-colors"
                aria-label="القائمة"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden glass-strong border-t border-white/10 animate-slide-up">
            <div className="max-w-6xl mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? 'bg-gradient-to-br from-navy-500 to-navy-700 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => { setProblemOpen(true); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-300 hover:bg-amber-500/10 transition-all"
              >
                <AlertTriangle className="w-5 h-5" />
                أبلغ عن مشكلة
              </button>
              <div className="border-t border-white/10 pt-3 space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 text-sky-300 text-sm">
                      <User className="w-4 h-4" />
                      <span className="truncate" dir="ltr">{user.email}</span>
                    </div>
                    <button
                      onClick={() => { onNavigate('account'); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <UserCircle className="w-5 h-5" />
                      حسابي
                    </button>
                    {user?.email === 'abdelrhmanofficial11@gmail.com' && (
                      <button
                        onClick={() => { onNavigate('admin'); setMobileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Shield className="w-5 h-5" />
                        لوحة الأمن
                      </button>
                    )}
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/10 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { onNavigate('login'); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-br from-sky-500 to-navy-600 transition-all"
                  >
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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
