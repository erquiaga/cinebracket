'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import BracketChart from '@/components/BracketChart';
import type { BracketState, Movie } from '@/types';
import styles from './ResultsView.module.css';

const { Title, Text } = Typography;

const ACCENT: Record<string, string> = { duo: '#00e054', solo: '#ff8000' };

export default function ResultsView() {
  const router = useRouter();
  const [winner, setWinner] = useState<Movie | null>(null);
  const [bracketState, setBracketState] = useState<BracketState | null>(null);
  const [accentColor, setAccentColor] = useState('#ff8000');
  const [downloading, setDownloading] = useState(false);
  const bracketRef = useRef<HTMLDivElement>(null);

  async function downloadBracket() {
    if (!bracketRef.current) return;
    setDownloading(true);
    try {
      const png = await toPng(bracketRef.current, { cacheBust: true, backgroundColor: '#fafae8' });
      const link = document.createElement('a');
      link.download = 'cinebracket.png';
      link.href = png;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    const rawWinner = sessionStorage.getItem('cinebracket_winner');
    const rawState = sessionStorage.getItem('cinebracket_bracket_state');
    const mode = sessionStorage.getItem('cinebracket_mode') ?? 'solo';
    if (!rawWinner) {
      router.replace('/');
      return;
    }
    setWinner(JSON.parse(rawWinner));
    setAccentColor(ACCENT[mode] ?? '#ff8000');
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
            color: accentColor,
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
        style={{ '--accent': accentColor } as React.CSSProperties}
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
            {winner.letterboxdUri && (
              <Button
                href={winner.letterboxdUri}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.letterboxdBtn}
              >
                Open in Letterboxd
              </Button>
            )}
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
          <div className={styles.recapHeader}>
            <Title
              level={3}
              className={styles.recapTitle}
              style={{
                fontFamily: 'var(--font-folio), sans-serif',
                fontWeight: 'normal',
                fontSize: '1.4rem',
                color: '#1c1a10',
                margin: 0,
                letterSpacing: '0.03em',
              }}
            >
              How it played out
            </Title>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadBracket}
              loading={downloading}
              className={styles.downloadBtn}
            >
              {downloading ? 'Generating...' : 'Download'}
            </Button>
          </div>
          <div ref={bracketRef} className={styles.bracketCapture}>
            <BracketChart state={bracketState} accentColor={accentColor} />
          </div>
        </motion.div>
      )}
    </main>
  );
}
