'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Typography } from 'antd';
import { motion } from 'framer-motion';
import BracketChart from '@/components/BracketChart';
import type { BracketState, Movie } from '@/types';
import styles from './ResultsView.module.css';

const { Title, Text } = Typography;

export default function ResultsView() {
  const router = useRouter();
  const [winner, setWinner] = useState<Movie | null>(null);
  const [bracketState, setBracketState] = useState<BracketState | null>(null);

  useEffect(() => {
    const rawWinner = sessionStorage.getItem('cinebracket_winner');
    const rawState = sessionStorage.getItem('cinebracket_bracket_state');
    if (!rawWinner) {
      router.replace('/');
      return;
    }
    setWinner(JSON.parse(rawWinner));
    if (rawState) setBracketState(JSON.parse(rawState));
  }, [router]);

  if (!winner) return null;

  return (
    <main className={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
        className={styles.announcement}
      >
        <Text className={styles.announcementLabel}>Your next watch is</Text>
        <Title
          level={1}
          className={styles.winnerTitle}
          style={{
            fontFamily: 'var(--font-folio), sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 'normal',
            color: '#ff8000',
            margin: 0,
            letterSpacing: '0.03em',
          }}
        >
          {winner.name}
        </Title>
        <Text className={styles.winnerMeta}>
          {winner.year}
          {winner.runtime ? ` · ${winner.runtime} min` : ''}
        </Text>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' as const }}
        className={styles.winnerCard}
      >
        <div className={styles.posterWrap}>
          {winner.poster ? (
            <Image
              src={winner.poster}
              alt={winner.name}
              fill
              className={styles.posterImg}
              sizes='220px'
            />
          ) : (
            <div className={styles.posterFallback}>
              <Text className={styles.posterFallbackText}>{winner.name}</Text>
            </div>
          )}
        </div>

        <div className={styles.winnerInfo}>
          {winner.overview && (
            <Text className={styles.overview}>{winner.overview}</Text>
          )}
          {winner.genres && winner.genres.length > 0 && (
            <div className={styles.genres}>
              {winner.genres.map((g) => (
                <span key={g} className={styles.genreTag}>
                  {g}
                </span>
              ))}
            </div>
          )}
          {winner.rating !== undefined && (
            <Text className={styles.rating}>
              ★ {winner.rating.toFixed(1)} on TMDB
            </Text>
          )}
          <div className={styles.actions}>
            <Button
              type='primary'
              onClick={() => {
                const mode = sessionStorage.getItem('cinebracket_mode') ?? 'solo';
                sessionStorage.removeItem('cinebracket_bracket_state');
                sessionStorage.removeItem('cinebracket_winner');
                router.push(`/${mode}/filter`);
              }}
              className={styles.playAgainBtn}
            >
              Play Again
            </Button>
            <Button
              onClick={() => {
                sessionStorage.clear();
                router.push('/');
              }}
              className={styles.homeBtn}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </motion.div>

      {bracketState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' as const }}
          className={styles.bracketRecap}
        >
          <Title
            level={3}
            className={styles.recapTitle}
            style={{
              fontFamily: 'var(--font-folio), sans-serif',
              fontWeight: 'normal',
              fontSize: '1.4rem',
              color: '#1c1a10',
              marginBottom: 20,
              letterSpacing: '0.03em',
            }}
          >
            How it played out
          </Title>
          <BracketChart state={bracketState} accentColor='#ff8000' />
        </motion.div>
      )}
    </main>
  );
}
