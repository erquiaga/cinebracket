'use client';

import { useState } from 'react';
import { Alert, Typography } from 'antd';
import UploadStep from './UploadStep';
import type { Movie } from '@/types';
import { intersectLists } from '@/lib/intersect';
import styles from './DualUploadStep.module.css';

const { Text } = Typography;

const MIN_SHARED = 4;

interface DualUploadStepProps {
  onReady: (movies: Movie[]) => void;
  onNotReady: () => void;
}

export default function DualUploadStep({
  onReady,
  onNotReady,
}: DualUploadStepProps) {
  const [myList, setMyList] = useState<Movie[] | null>(null);
  const [friendList, setFriendList] = useState<Movie[] | null>(null);

  function handleMyList(movies: Movie[]) {
    setMyList(movies);
    resolve(movies, friendList);
  }
  function handleFriendList(movies: Movie[]) {
    setFriendList(movies);
    resolve(myList, movies);
  }

  function resolve(a: Movie[] | null, b: Movie[] | null) {
    if (!a || !b) return;
    const shared = intersectLists(a, b);
    if (shared.length >= MIN_SHARED) onReady(shared);
    else onNotReady();
  }

  const shared =
    myList && friendList ? intersectLists(myList, friendList) : null;
  const tooFew = shared !== null && shared.length < MIN_SHARED;

  return (
    <div className={styles.root}>
      <div className={styles.uploadsRow}>
        <div className={styles.uploadCol}>
          <Text className={styles.colLabel}>Your List</Text>
          <UploadStep
            label='Upload your watchlist'
            onParsed={handleMyList}
            onClear={() => {
              setMyList(null);
              onNotReady();
            }}
          />
        </div>
        <div className={styles.uploadCol}>
          <Text className={styles.colLabel}>Friend's List</Text>
          <UploadStep
            label="Upload your friend's watchlist"
            onParsed={handleFriendList}
            onClear={() => {
              setFriendList(null);
              onNotReady();
            }}
          />
        </div>
      </div>

      {shared !== null && (
        <div className={styles.statusRow}>
          {tooFew ? (
            <Alert
              type='warning'
              showIcon
              message={`Only ${shared.length} shared movie${shared.length === 1 ? '' : 's'} found`}
              description='You need at least 4 films in common to run a bracket. Try uploading full watchlists rather than short lists.'
              style={{
                background: '#fff9e6',
                border: '1px solid #C8A97E',
                borderRadius: 10,
              }}
            />
          ) : (
            <div className={styles.sharedBadge}>
              <Text className={styles.sharedCount}>
                {shared.length} shared movies found
              </Text>
              <Text className={styles.sharedCheck}>✓</Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
