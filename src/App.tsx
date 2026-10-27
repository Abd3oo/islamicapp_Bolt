import { useState, useEffect } from 'react';
import Layout, { type Page } from './components/Layout';
import BlockedScreen from './components/BlockedScreen';
import Home from './pages/Home';
import Hadith from './pages/Hadith';
import Scanner from './pages/Scanner';
import Admin from './pages/Admin';
import { checkBlockedStatus } from './lib/admin';

type BlockState = 'checking' | 'blocked' | 'ok';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [blockState, setBlockState] = useState<BlockState>('checking');
  const [blockReason, setBlockReason] = useState<string | null>(null);

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

  if (blockState === 'checking') {
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
    <Layout currentPage={page} onNavigate={setPage}>
      {page === 'home' && <Home onNavigate={setPage} />}
      {page === 'hadith' && <Hadith />}
      {page === 'scanner' && <Scanner />}
      {page === 'admin' && <Admin onExit={() => setPage('home')} />}
    </Layout>
  );
}
