import { useState, useEffect } from 'react';
import Layout, { type Page } from './components/Layout';
import BlockedScreen from './components/BlockedScreen';
import { AuthProvider, useAuth } from './lib/auth';
import { Shield } from 'lucide-react';
import type { Country } from './lib/alternatives';
import Home from './pages/Home';
import Hadith from './pages/Hadith';
import Scanner from './pages/Scanner';
import Admin from './pages/Admin';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { checkBlockedStatus } from './lib/admin';

type BlockState = 'checking' | 'blocked' | 'ok';

function AppContent() {
  const [page, setPage] = useState<Page>('home');
  const [blockState, setBlockState] = useState<BlockState>('checking');
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.email === 'abdelrhmanofficial11@gmail.com';
  const [country, setCountry] = useState<Country>('مصر');

  useEffect(() => {
    let cancelled = false;
    checkBlockedStatus()
      .then((res) => {
        if (cancelled) return;
        if (res.blocked) {
          setBlockReason(res.reason);
          setBlockState('blocked');
        } else {
          setBlockState('ok');
        }
      })
      .catch(() => {
        if (!cancelled) setBlockState('ok');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (blockState === 'checking' || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="w-10 h-10 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (blockState === 'blocked') {
    return <BlockedScreen reason={blockReason} />;
  }

  return (
    <Layout currentPage={page} onNavigate={setPage} country={country} onCountryChange={setCountry}>
      {page === 'home' && <Home onNavigate={setPage} />}
      {page === 'hadith' && <Hadith />}
      {page === 'scanner' && <Scanner country={country} />}
      {page === 'admin' && isAdmin && <Admin onExit={() => setPage('home')} />}
      {page === 'admin' && !isAdmin && (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="glass-strong rounded-3xl p-8 max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-rose-300" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">غير مصرح لك</h1>
            <p className="text-slate-400 text-sm mb-5">لوحة الأمن متاحة للأدمن فقط.</p>
            <button
              onClick={() => setPage('home')}
              className="inline-flex items-center gap-2 bg-gradient-to-br from-sky-500 to-navy-600 text-white font-medium px-5 py-2.5 rounded-2xl transition-all"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      )}
      {page === 'login' && <Login onNavigate={() => setPage('signup')} onBack={() => setPage('home')} />}
      {page === 'signup' && <SignUp onNavigate={() => setPage('login')} onBack={() => setPage('home')} />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
