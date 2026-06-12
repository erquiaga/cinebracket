'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Card, Typography } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';
import HelpModal from '@/components/HelpModal';
import styles from './ModeSelector.module.css';

const { Title, Text } = Typography;

const MODES = [
  {
    key: 'solo',
    label: 'Solo',
    tagline: 'Your watchlist, your bracket',
    description:
      'Upload your Letterboxd Watchlist CSV and let the bracket decide your next watch.',
    icon: <UserOutlined />,
    ctaColor: '#ff8000',
  },
  {
    key: 'duo',
    label: 'Duo',
    tagline: 'Find the film you both want',
    description:
      'Upload two Letterboxd Watchlist CSVs and battle it out from your shared movies.',
    icon: <TeamOutlined />,
    ctaColor: '#00e054',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function ModeSelector() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className={styles.root}>
      <div className={styles.authBadge}>
        <button
          className={styles.helpBtn}
          onClick={() => setHelpOpen(true)}
          aria-label='Help'
        >
          ?
        </button>
        {!loading && (
          <>
            {user ? (
              <>
                <Text className={styles.authEmail}>{user.email}</Text>
                <Button
                  size='small'
                  type='text'
                  onClick={signOut}
                  className={styles.signOutBtn}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                size='small'
                onClick={() => setAuthOpen(true)}
                className={styles.signInBtn}
              >
                Sign in
              </Button>
            )}
          </>
        )}
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <motion.div
        initial='hidden'
        animate='visible'
        variants={headingVariants}
        className={styles.heading}
      >
        <Title
          level={1}
          className={styles.logo}
          style={{
            fontFamily: "'MexcellentRg', sans-serif",
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 'normal',
            letterSpacing: '0.04em',
            marginBottom: 16,
            color: 'inherit',
          }}
        >
          <span className={styles.logoOrange}>cine</span>
          <span className={styles.logoGreen}>bracket</span>
        </Title>
        <Text className={styles.tagline}>May the best film win.</Text>
      </motion.div>

      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerVariants}
        className={styles.cards}
      >
        {MODES.map((mode) => (
          <motion.div
            key={mode.key}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ '--cta': mode.ctaColor } as React.CSSProperties}
          >
            <Card
              hoverable
              onClick={() => router.push(`/${mode.key}`)}
              className={styles.card}
              styles={{ body: { padding: 0 } }}
            >
              <div className={styles.cardBody}>
                <div className={styles.modeIcon}>{mode.icon}</div>
                <div>
                  <Title level={3} className={styles.cardLabel}>
                    {mode.label}
                  </Title>
                  <Text className={styles.modeTagline}>{mode.tagline}</Text>
                </div>
                <Text className={styles.cardDescription}>{mode.description}</Text>
                <Button className={styles.getStartedBtn}>Get Started →</Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <footer className={styles.tmdbFooter}>
        <Image src='/tmdb-logo.svg' alt='TMDB logo' width={60} height={28} />
        <span className={styles.tmdbNotice}>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </span>
      </footer>
    </div>
  );
}
