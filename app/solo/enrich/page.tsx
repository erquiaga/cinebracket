'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import EnrichmentProgress from '@/components/EnrichmentProgress';
import { enrichMovies } from '@/lib/tmdb';
import { saveWatchlist } from '@/lib/watchlist';
import type { Movie } from '@/types';
import styles from '@/app/page.module.css';

const { Title, Text } = Typography;

export default function SoloEnrichPage() {
  const router = useRouter();
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentName, setCurrentName] = useState('');
  const [finished, setFinished] = useState(false);
  const [alreadyEnriched, setAlreadyEnriched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('cinebracket_movies');
    if (!raw) { router.replace('/solo'); return; }

    if (sessionStorage.getItem('cinebracket_enriched') === '1') {
      setAlreadyEnriched(true);
      setFinished(true);
      return;
    }

    const movies: Movie[] = JSON.parse(raw);
    setTotal(movies.length);

    enrichMovies(movies, (d, t, name) => { setDone(d); setTotal(t); setCurrentName(name); })
      .then(async (enriched) => {
        sessionStorage.setItem('cinebracket_movies', JSON.stringify(enriched));
        sessionStorage.setItem('cinebracket_enriched', '1');
        await saveWatchlist('solo', enriched);
        setFinished(true);
      })
      .catch(() => setError('Something went wrong fetching movie data. Try again.'));
  }, [router]);

  return (
    <main className={styles.main}>
      <div className={styles.headerArea}>
        <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => router.push('/solo')} disabled={!finished && !error} className={styles.backBtn}>
          Back
        </Button>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' as const }}>
          <Title level={2} className={styles.pageTitle} style={{ fontFamily: 'var(--font-folio), sans-serif', fontWeight: 'normal', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.04em' }}>
            <span className={styles.soloAccent}>GATHERING DATA</span>
          </Title>
          <Text className={styles.subtitle}>Pulling posters, ratings, and streaming info from TMDB.</Text>
        </motion.div>
      </div>

      <motion.div className={styles.contentArea} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' as const }}>
        {error ? (
          <Text className={styles.errorText}>{error}</Text>
        ) : alreadyEnriched ? (
          <Text className={styles.enrichReady}>✓ Your saved list is ready to go.</Text>
        ) : (
          <EnrichmentProgress done={done} total={total} currentName={currentName} accentColor='#ff8000' />
        )}
      </motion.div>

      <motion.div className={styles.contentArea} initial={{ opacity: 0 }} animate={{ opacity: finished ? 1 : 0.3 }} transition={{ duration: 0.3 }}>
        <Button
          disabled={!finished}
          onClick={() => router.push('/solo/filter')}
          className={`${styles.continueBtn} ${finished ? styles.continueBtnOrangeActive : styles.continueBtnInactive}`}
        >
          Continue to Filters →
        </Button>
      </motion.div>
    </main>
  );
}
