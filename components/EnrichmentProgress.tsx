'use client';

import { Progress, Typography } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleFilled } from '@ant-design/icons';
import styles from './EnrichmentProgress.module.css';

const { Text } = Typography;

interface EnrichmentProgressProps {
  done: number;
  total: number;
  currentName: string;
  accentColor?: string;
}

export default function EnrichmentProgress({
  done,
  total,
  currentName,
  accentColor = '#ff8000',
}: EnrichmentProgressProps) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const isDone = done === total && total > 0;

  return (
    <div className={styles.root} style={{ '--accent': accentColor } as React.CSSProperties}>
      <AnimatePresence mode='wait'>
        {isDone ? (
          <motion.div
            key='done'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' as const }}
            className={styles.doneState}
          >
            <CheckCircleFilled className={styles.doneIcon} />
            <Text className={styles.doneTitle}>
              All {total} movies enriched
            </Text>
            <Text className={styles.doneSubtitle}>
              Posters, ratings, genres, and streaming info loaded.
            </Text>
          </motion.div>
        ) : (
          <motion.div
            key='progress'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.progressState}
          >
            <Text className={styles.progressTitle}>Fetching movie data…</Text>
            <Progress
              percent={percent}
              strokeColor={accentColor}
              railColor='#e8e0c4'
              showInfo={false}
              className={styles.progressBar}
            />
            <div className={styles.progressFooter}>
              <Text className={styles.progressText}>
                {done} / {total} movies
              </Text>
              <AnimatePresence mode='wait'>
                <motion.span
                  key={currentName}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className={styles.currentMovie}
                >
                  {currentName}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
