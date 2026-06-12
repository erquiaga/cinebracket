'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import DualUploadStep from '@/components/DualUploadStep';
import { useAuth } from '@/components/AuthProvider';
import { loadWatchlist, type SavedWatchlist } from '@/lib/watchlist';
import type { Movie } from '@/types';
import styles from '@/app/page.module.css';

const { Title, Text } = Typography;

export default function DuoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [cached, setCached] = useState<SavedWatchlist | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loadingCache, setLoadingCache] = useState(true);

  useEffect(() => {
    if (!user) { setCached(null); setLoadingCache(false); return; }
    loadWatchlist('duo').then((result) => { setCached(result); setLoadingCache(false); });
  }, [user]);

  const hasCached = cached !== null && !showUpload;

  function useCached() {
    if (!cached) return;
    sessionStorage.setItem('cinebracket_movies', JSON.stringify(cached.movies));
    sessionStorage.setItem('cinebracket_enriched', '1');
    router.push('/duo/filter');
  }

  return (
    <main className={styles.main}>
      <div className={styles.headerAreaWide}>
        <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => router.push('/')} className={styles.backBtn}>
          Back
        </Button>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' as const }}>
          <Title level={2} className={styles.pageTitle} style={{ fontFamily: 'var(--font-folio), sans-serif', fontWeight: 'normal', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.04em' }}>
            <span className={styles.duoAccent}>DUO</span>
          </Title>
          <Text className={styles.subtitle}>Upload both watchlists. The bracket runs from the films you share.</Text>
        </motion.div>
      </div>

      {!loadingCache && hasCached && (
        <motion.div className={styles.contentAreaWide} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' as const }}>
          <div className={`${styles.cachedBanner} ${styles.cachedBannerDuo}`}>
            <div>
              <Text className={styles.cachedTitle}>Saved shared watchlist ({cached!.movies.length} movies)</Text>
              <Text className={`${styles.cachedDate} ${styles.cachedDateDuo}`}>
                Last updated {new Date(cached!.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </div>
            <div className={styles.bannerActions}>
              <Button type='primary' onClick={useCached} className={styles.primaryBtnGreen}>
                Use saved list →
              </Button>
              <Button onClick={() => setShowUpload(true)} className={styles.secondaryBtn}>
                Upload new CSVs
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {!loadingCache && !hasCached && (
        <>
          <motion.div className={styles.contentAreaWide} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' as const }}>
            <DualUploadStep onReady={setMovies} onNotReady={() => setMovies(null)} />
          </motion.div>

          {!user && <Text className={styles.signInNote}>Sign in on the home page to save your list for next time.</Text>}

          <motion.div className={styles.contentAreaWide} initial={{ opacity: 0 }} animate={{ opacity: movies ? 1 : 0.4 }} transition={{ duration: 0.3 }}>
            <Button
              disabled={!movies}
              onClick={() => {
                if (!movies) return;
                sessionStorage.setItem('cinebracket_movies', JSON.stringify(movies));
                sessionStorage.removeItem('cinebracket_enriched');
                router.push('/duo/enrich');
              }}
              className={`${styles.continueBtn} ${movies ? styles.continueBtnGreenActive : styles.continueBtnInactive}`}
            >
              {movies ? `Continue with ${movies.length} shared movies →` : 'Upload both lists to continue'}
            </Button>
          </motion.div>
        </>
      )}
    </main>
  );
}
