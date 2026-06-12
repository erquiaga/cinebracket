'use client';

import { useState } from 'react';
import { Upload, Typography, Button } from 'antd';
import {
  InboxOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ReloadOutlined,
} from '@ant-design/icons';
import type { Movie } from '@/types';
import { parseCsv } from '@/lib/parseCsv';
import styles from './UploadStep.module.css';

const { Dragger } = Upload;
const { Text } = Typography;

type Status = 'idle' | 'parsing' | 'success' | 'error';

interface UploadStepProps {
  label: string;
  onParsed: (movies: Movie[]) => void;
  onClear?: () => void;
}

export default function UploadStep({
  label,
  onParsed,
  onClear,
}: UploadStepProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [movieCount, setMovieCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');

  async function handleFile(file: File) {
    setStatus('parsing');
    setFileName(file.name);
    try {
      const movies = await parseCsv(file);
      if (movies.length === 0) {
        setStatus('error');
        setErrorMsg(
          'No valid movies found. Make sure this is a Letterboxd watchlist CSV.',
        );
        return;
      }
      setMovieCount(movies.length);
      setStatus('success');
      onParsed(movies);
    } catch {
      setStatus('error');
      setErrorMsg(
        "Could not parse the file. Make sure it's a valid Letterboxd CSV.",
      );
    }
  }

  function reset() {
    setStatus('idle');
    setMovieCount(0);
    setErrorMsg('');
    setFileName('');
    onClear?.();
  }

  if (status === 'success') {
    return (
      <div className={`${styles.statusBox} ${styles.success}`}>
        <CheckCircleFilled className={styles.successIcon} />
        <Text className={styles.statusTitle}>{movieCount} movies loaded</Text>
        <Text className={styles.statusMeta}>{fileName}</Text>
        <Button
          size='small'
          icon={<ReloadOutlined />}
          onClick={reset}
          className={styles.changeFileBtn}
        >
          Change file
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`${styles.statusBox} ${styles.error}`}>
        <CloseCircleFilled className={styles.errorIcon} />
        <Text className={styles.statusError}>{errorMsg}</Text>
        <Button
          size='small'
          icon={<ReloadOutlined />}
          onClick={reset}
          className={styles.changeFileBtn}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <Dragger
      accept='.csv'
      showUploadList={false}
      disabled={status === 'parsing'}
      beforeUpload={(file) => {
        handleFile(file);
        return false;
      }}
      className={styles.dragger}
    >
      <div className={styles.draggerInner}>
        <InboxOutlined
          className={`${styles.uploadIcon} ${status === 'parsing' ? styles.uploadIconParsing : ''}`}
        />
        <Text className={styles.draggerLabel}>
          {status === 'parsing' ? 'Parsing…' : label}
        </Text>
        <Text className={styles.draggerHint}>
          {status === 'parsing'
            ? 'Reading your watchlist'
            : 'Drag & drop or click to select a .csv file'}
        </Text>
      </div>
    </Dragger>
  );
}
