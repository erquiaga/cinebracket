'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Typography } from 'antd';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

const { Text } = Typography;

type Status = 'loading' | 'ready' | 'done' | 'invalid';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready');
      }
    });

    // If there's no recovery token in the URL at all, show invalid state
    const hasCode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('code');
    const hasHash = typeof window !== 'undefined' && window.location.hash.includes('type=recovery');
    if (!hasCode && !hasHash) {
      setStatus('invalid');
    }

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit() {
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setStatus('done');
      setTimeout(() => router.push('/'), 2500);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <p className={styles.spinner}>Verifying reset link...</p>
        )}

        {status === 'invalid' && (
          <>
            <p className={styles.heading}>Invalid reset link</p>
            <p className={styles.hint}>
              This link has expired or is not valid. Request a new one from the sign-in screen.
            </p>
            <button className={styles.homeLink} onClick={() => router.push('/')}>
              Back to home
            </button>
          </>
        )}

        {status === 'ready' && (
          <>
            <p className={styles.heading}>Set a new password</p>
            <p className={styles.hint}>Choose a new password for your account.</p>

            <Input.Password
              placeholder="New password"
              size="large"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={handleSubmit}
              className={styles.formInput}
            />
            <Input.Password
              placeholder="Confirm new password"
              size="large"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onPressEnter={handleSubmit}
              className={styles.formInput}
            />

            {error && <Text className={styles.errorText}>{error}</Text>}

            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSubmit}
              disabled={!password || !confirm}
              block
              className={styles.submitBtn}
            >
              Update password
            </Button>
          </>
        )}

        {status === 'done' && (
          <>
            <p className={styles.heading}>Password updated</p>
            <p className={styles.hint}>You're all set. Taking you back to the home page...</p>
          </>
        )}
      </div>
    </div>
  );
}
