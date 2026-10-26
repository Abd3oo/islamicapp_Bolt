import { useState } from 'react';
import Layout, { type Page } from './components/Layout';
import Home from './pages/Home';
import Hadith from './pages/Hadith';
import Scanner from './pages/Scanner';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {page === 'home' && <Home onNavigate={setPage} />}
      {page === 'hadith' && <Hadith />}
      {page === 'scanner' && <Scanner />}
    </Layout>
  );
}
