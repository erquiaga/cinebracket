'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Progress, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { AnimatePresence } from 'framer-motion';
import BracketMatchup from '@/components/BracketMatchup';
import {
  createBracket,
  getCurrentMatchup,
  getRoundInfo,
  pickWinner,
} from '@/lib/bracketEngine';
import type { BracketState, Movie } from '@/types';
import styles from './BracketView.module.css';

const { Title, Text } = Typography;

interface BracketViewProps {
  accentColor: string;
  filterHref: string;
}

export default function BracketView({
  accentColor,
  filterHref,
}: BracketViewProps) {
  const router = useRouter();
  const [state, setState] = useState<BracketState | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('cinebracket_bracket_state');
    if (!raw) {
      const moviesRaw = sessionStorage.getItem('cinebracket_movies');
      if (!moviesRaw) {
        router.replace(filterHref);
        return;
      }
      setState(createBracket(JSON.parse(moviesRaw)));
    } else {
      setState(JSON.parse(raw));
    }
  }, [router, filterHref]);

  function handlePick(winner: Movie) {
    if (!state) return;
    const next = pickWinner(state, winner);
    sessionStorage.setItem('cinebracket_bracket_state', JSON.stringify(next));
    setState(next);
    if (next.winner) {
      sessionStorage.setItem('cinebracket_winner', JSON.stringify(next.winner));
      router.push('/results');
    }
  }

  if (!state) return null;

  const matchup = getCurrentMatchup(state);
  const { roundNumber, totalRounds, matchupNumber, matchupsTotal } =
    getRoundInfo(state);

  const totalMatchups = state.rounds[0].length - 1;
  const completedMatchups =
    state.rounds
      .slice(0, state.currentRound)
      .reduce((sum, r) => sum + Math.floor(r.length / 2), 0) +
    state.currentMatchupIndex;
  const progressPercent = Math.round((completedMatchups / totalMatchups) * 100);

  return (
    <main className={styles.page} style={{ '--accent': accentColor } as React.CSSProperties}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <Title
            level={3}
            className={styles.title}
            style={{
              fontFamily: 'var(--font-folio), sans-serif',
              fontWeight: 'normal',
              fontSize: '1.6rem',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            <span className={styles.accentSpan}>BRACKET</span>
          </Title>
          <div className={styles.headerActions}>
            <Button
              type='text'
              size='small'
              onClick={() => router.push(filterHref)}
              className={styles.headerBtn}
            >
              ← Restart
            </Button>
            <Button
              type='text'
              size='small'
              icon={<HomeOutlined />}
              onClick={() => router.push('/')}
              className={styles.headerBtn}
            >
              Home
            </Button>
          </div>
        </div>

        <Progress
          percent={progressPercent}
          strokeColor={accentColor}
          railColor='#e8e0c4'
          showInfo={false}
          size={6}
        />
        <Text className={styles.progressMeta}>
          Round {roundNumber} of {totalRounds} · {completedMatchups} of{' '}
          {totalMatchups} picks made
        </Text>
      </div>

      <div className={styles.matchupArea}>
        <AnimatePresence mode='wait'>
          {matchup && (
            <BracketMatchup
              key={`${matchup[0].name}-${matchup[1].name}-${state.currentRound}-${state.currentMatchupIndex}`}
              movieA={matchup[0]}
              movieB={matchup[1]}
              onPick={handlePick}
              roundNumber={roundNumber}
              matchupNumber={matchupNumber}
              matchupsTotal={matchupsTotal}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
