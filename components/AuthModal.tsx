'use client';

import { useState } from 'react';
import { Modal, Input, Button, Typography } from 'antd';
import { supabase } from '@/lib/supabase';
import styles from './AuthModal.module.css';

const { Text } = Typography;

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type View = 'signin' | 'signup' | 'forgot';

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [view, setView] = useState<View>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function reset() {
    setEmail('');
    setPassword('');
    setError('');
    setMessage('');
  }

  function switchView(next: View) {
    reset();
    setView(next);
  }

  async function handleSubmit() {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setMessage('');

    if (view === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else { reset(); onClose(); }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Account created! Check your email to confirm, then sign in.');
    }
    setLoading(false);
  }

  async function handleForgot() {
    if (!email) return;
    setLoading(true);
    setError('');
    setMessage('');

    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) setError(error.message);
    else setMessage("If that email is registered, you'll get a reset link shortly.");
    setLoading(false);
  }

  return (
    <Modal
      open={open}
      onCancel={() => { reset(); setView('signin'); onClose(); }}
      footer={null}
      title={null}
      width={400}
    >
      {view === 'forgot' ? (
        <div className={styles.form}>
          <button className={styles.backBtn} onClick={() => switchView('signin')}>
            ← Back to sign in
          </button>

          <p className={styles.forgotHeading}>Reset your password</p>
          <p className={styles.forgotHint}>
            Enter your email and we'll send you a link to set a new password.
          </p>

          <Input
            placeholder="Email"
            type="email"
            size="large"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onPressEnter={handleForgot}
            className={styles.formInput}
          />

          {error && <Text className={styles.errorText}>{error}</Text>}
          {message && <Text className={styles.successText}>{message}</Text>}

          {!message && (
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleForgot}
              disabled={!email}
              block
              className={styles.primaryBtn}
            >
              Send reset link
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.form}>
          <div className={styles.tabBar}>
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchView(t)}
                className={`${styles.tab} ${view === t ? styles.tabActive : ''}`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <Input
            placeholder="Email"
            type="email"
            size="large"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onPressEnter={handleSubmit}
            className={styles.formInput}
          />
          <Input.Password
            placeholder="Password"
            size="large"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleSubmit}
            className={styles.formInput}
          />

          {view === 'signin' && (
            <button className={styles.forgotLink} onClick={() => switchView('forgot')}>
              Forgot your password?
            </button>
          )}

          {error && <Text className={styles.errorText}>{error}</Text>}
          {message && <Text className={styles.successText}>{message}</Text>}

          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
            block
            style={{ background: '#ff8000', border: 'none', fontWeight: 700, borderRadius: 8, height: 44 }}
          >
            {view === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
