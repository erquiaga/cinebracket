'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Typography } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { Movie } from '@/types';
import styles from './MovieCard.module.css';

const { Text } = Typography;

interface MovieCardProps {
  movie: Movie;
  onPick: () => void;
  picked?: boolean;
  lost?: boolean;
}

export default function MovieCard({
  movie,
  onPick,
  picked = false,
  lost = false,
}: MovieCardProps) {
  const [synopsisOpen, setSynopsisOpen] = useState(false);
  const [streamingOpen, setStreamingOpen] = useState(false);

  const cardClass = [
    styles.card,
    picked ? styles.picked : '',
    lost ? styles.lost : '',
  ].join(' ');

  return (
    <motion.div
      onClick={!picked && !lost ? onPick : undefined}
      animate={{
        opacity: lost ? 0.2 : 1,
        scale: picked ? 1.04 : lost ? 0.96 : 1,
      }}
      transition={{ duration: 0.25 }}
      className={cardClass}
      whileHover={
        !picked && !lost
          ? { scale: 1.02, boxShadow: '0 8px 24px rgba(100,90,40,0.18)' }
          : {}
      }
    >
      <div className={styles.poster}>
        {movie.poster ? (
          <Image
            src={movie.poster}
            alt={movie.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes='280px'
          />
        ) : (
          <div className={styles.posterPlaceholder}>
            <Text className={styles.posterPlaceholderText}>{movie.name}</Text>
          </div>
        )}
        {movie.rating !== undefined && (
          <div className={styles.ratingBadge}>
            <StarFilled style={{ fontSize: 10, color: '#ff8000' }} />
            <Text className={styles.ratingText}>{movie.rating.toFixed(1)}</Text>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <Text className={styles.title}>{movie.name}</Text>
        <Text className={styles.meta}>
          {movie.year}
          {movie.runtime ? ` · ${movie.runtime} min` : ''}
        </Text>
        {movie.overview && (
          <div>
            <button
              className={styles.synopsisToggle}
              onClick={(e) => {
                e.stopPropagation();
                setSynopsisOpen((o) => !o);
              }}
            >
              Synopsis {synopsisOpen ? '▴' : '▾'}
            </button>
            <AnimatePresence initial={false}>
              {synopsisOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 80, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' as const }}
                  style={{ overflowY: 'auto' }}
                >
                  <Text className={styles.synopsisText}>{movie.overview}</Text>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {movie.streamingProviders && movie.streamingProviders.length > 0 && (
          <div>
            <button
              className={styles.synopsisToggle}
              onClick={(e) => {
                e.stopPropagation();
                setStreamingOpen((o) => !o);
              }}
            >
              Streaming {streamingOpen ? '▴' : '▾'}
            </button>
            <AnimatePresence initial={false}>
              {streamingOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' as const }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className={styles.streamingList}>
                    {movie.streamingProviders.map((p) => (
                      <span key={p} className={styles.streamingTag}>{p}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {movie.genres && movie.genres.length > 0 && (
          <div className={styles.genres}>
            {movie.genres.slice(0, 3).map((g) => (
              <span key={g} className={styles.genreTag}>
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
