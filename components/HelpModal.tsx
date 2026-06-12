'use client';

import { Modal, Typography } from 'antd';
import styles from './HelpModal.module.css';

const { Text, Title } = Typography;

const STEPS = [
  {
    n: 1,
    heading: 'Open your Letterboxd watchlist',
    body: (
      <>
        Sign in at{' '}
        <a
          href='https://letterboxd.com'
          target='_blank'
          rel='noopener noreferrer'
          className={styles.link}
        >
          letterboxd.com
        </a>
        , then click your username and select <strong>Watchlist</strong>.
      </>
    ),
  },
  {
    n: 2,
    heading: 'Click "Export watchlist"',
    body: (
      <>
        On the right side of your watchlist page you'll see an{' '}
        <strong>Export watchlist</strong> button. Click it and your browser will
        download a CSV file.
      </>
    ),
  },
  {
    n: 3,
    heading: 'Upload the CSV to CineBracket',
    body: "Drag and drop (or click to select) the downloaded file on the Solo or Duo upload page. That's it.",
  },
];

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      styles={{ body: { padding: '8px 0 0' } }}
    >
      <Title level={4} className={styles.modalTitle}>
        How to get your Letterboxd watchlist
      </Title>
      <ol className={styles.steps}>
        {STEPS.map(({ n, heading, body }) => (
          <li key={n} className={styles.step}>
            <div className={styles.stepNumber}>{n}</div>
            <div className={styles.stepBody}>
              <Text className={styles.stepHeading}>{heading}</Text>
              <Text className={styles.stepText}>{body}</Text>
            </div>
          </li>
        ))}
      </ol>

      <div className={styles.note}>
        <Text className={styles.noteText}>
          Tip: your CSV includes your full watchlist. Use the Filter page inside
          CineBracket to narrow things down before the bracket starts.
        </Text>
      </div>
    </Modal>
  );
}
