'use client';

import { useState } from 'react';
import { Typography } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from './MovieCard';
import type { Movie } from '@/types';
import styles from './BracketMatchup.module.css';

const { Text } = Typography;

interface BracketMatchupProps {
  movieA: Movie;
  movieB: Movie;
  onPick: (winner: Movie) => void;
  roundNumber: number;
  matchupNumber: number;
  matchupsTotal: number;
}

export default function BracketMatchup({
  movieA,
  movieB,
  onPick,
  roundNumber,
  matchupNumber,
  matchupsTotal,
}: BracketMatchupProps) {
  const [picked, setPicked] = useState<Movie | null>(null);

  function handlePick(winner: Movie) {
    if (picked) return;
    setPicked(winner);
    setTimeout(() => onPick(winner), 420);
  }

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={`${movieA.name}-${movieB.name}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35, ease: 'easeOut' as const }}
        className={styles.root}
      >
        <div className={styles.roundInfo}>
          <Text className={styles.roundText}>
            Round {roundNumber} · Match {matchupNumber} of {matchupsTotal}
          </Text>
        </div>

        <div className='matchup-row'>
          <div className={styles.cardWrapper}>
            <MovieCard
              movie={movieA}
              onPick={() => handlePick(movieA)}
              picked={picked?.name === movieA.name}
              lost={picked !== null && picked.name !== movieA.name}
            />
          </div>

          <div className={styles.vsWrapper}>
            <Text className={styles.vsLabel}>VS</Text>
          </div>

          <div className={styles.cardWrapper}>
            <MovieCard
              movie={movieB}
              onPick={() => handlePick(movieB)}
              picked={picked?.name === movieB.name}
              lost={picked !== null && picked.name !== movieB.name}
            />
          </div>
        </div>

        {!picked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Text className={styles.hint}>
              Click a poster to pick the winner
            </Text>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
