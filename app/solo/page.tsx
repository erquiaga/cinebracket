'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import UploadStep from '@/components/UploadStep';
import { useAuth } from '@/components/AuthProvider';
import { loadWatchlist, type SavedWatchlist } from '@/lib/watchlist';
import type { Movie } from '@/types';
import styles from '@/app/page.module.css';

const { Title, Text } = Typography;

export default function SoloPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [cached, setCached] = useState<SavedWatchlist | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loadingCache, setLoadingCache] = useState(true);

  useEffect(() => {
    if (!user) { setCached(null); setLoadingCache(false); return; }
    loadWatchlist('solo').then((result) => { setCached(result); setLoadingCache(false); });
  }, [user]);

  const hasCached = cached !== null && !showUpload;

  function useCached() {
    if (!cached) return;
    sessionStorage.setItem('cinebracket_movies', JSON.stringify(cached.movies));
    sessionStorage.setItem('cinebracket_enriched', '1');
    router.push('/solo/filter');
  }

  return (
    <main className={styles.main}>
      <div className={styles.headerArea}>
        <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => router.push('/')} className={styles.backBtn}>
          Back
        </Button>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' as const }}>
          <Title level={2} className={styles.pageTitle} style={{ fontFamily: 'var(--font-folio), sans-serif', fontWeight: 'normal', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.04em' }}>
            <span className={styles.soloAccent}>SOLO</span>
          </Title>
          <Text className={styles.subtitle}>Upload your Letterboxd watchlist CSV to get started.</Text>
        </motion.div>
      </div>

      {!loadingCache && hasCached && (
        <motion.div className={styles.contentArea} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' as const }}>
          <div className={`${styles.cachedBanner} ${styles.cachedBannerSolo}`}>
            <div>
              <Text className={styles.cachedTitle}>Saved watchlist ({cached!.movies.length} movies)</Text>
              <Text className={`${styles.cachedDate} ${styles.cachedDateSolo}`}>
                Last updated {new Date(cached!.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </div>
            <div className={styles.bannerActions}>
              <Button type='primary' onClick={useCached} className={styles.primaryBtnOrange}>
                Use saved list →
              </Button>
              <Button onClick={() => setShowUpload(true)} className={styles.secondaryBtn}>
                Upload new CSV
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {!loadingCache && !hasCached && (
        <>
          <motion.div className={styles.contentArea} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' as const }}>
            <UploadStep label='Upload your watchlist' onParsed={setMovies} onClear={() => setMovies(null)} />
          </motion.div>

          {!user && <Text className={styles.signInNote}>Sign in on the home page to save your list for next time.</Text>}

          <motion.div className={styles.contentArea} initial={{ opacity: 0 }} animate={{ opacity: movies ? 1 : 0.4 }} transition={{ duration: 0.3 }}>
            <Button
              disabled={!movies}
              onClick={() => {
                if (!movies) return;
                sessionStorage.setItem('cinebracket_movies', JSON.stringify(movies));
                sessionStorage.removeItem('cinebracket_enriched');
                router.push('/solo/enrich');
              }}
              className={`${styles.continueBtn} ${movies ? styles.continueBtnOrangeActive : styles.continueBtnInactive}`}
            >
              {movies ? `Continue with ${movies.length} movies →` : 'Upload a CSV to continue'}
            </Button>
          </motion.div>
        </>
      )}
    </main>
  );
}
