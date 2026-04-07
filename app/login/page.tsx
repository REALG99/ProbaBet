'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

type Mode = 'login' | 'register' | 'reset' | 'update';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const forcedMode = searchParams.get('mode');
    const callbackError = searchParams.get('error');
    if (forcedMode === 'register' || forcedMode === 'reset' || forcedMode === 'update') {
      setMode(forcedMode);
    }
    if (callbackError) setError(callbackError);

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update');
        setMessage('Link verificato. Ora imposta una nuova password.');
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      if (forcedMode === 'update') {
        setMode('update');
        return;
      }
      router.replace('/dashboard');
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router, searchParams]);

  const title = useMemo(() => {
    if (mode === 'register') return 'Crea account';
    if (mode === 'reset') return 'Password dimenticata';
    if (mode === 'update') return 'Imposta nuova password';
    return 'Accedi alla piattaforma';
  }, [mode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (mode === 'login') {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          setError('Email o password errata');
          return;
        }

        const user = data.user;
        const confirmed = !!user?.email_confirmed_at;
        if (!confirmed) {
          await supabase.auth.signOut();
          setMessage('Conferma prima la tua email. Ti abbiamo inviato il link di verifica.');
          return;
        }

        router.push('/dashboard');
        return;
      }

      if (mode === 'register') {
        const redirectBase = typeof window !== 'undefined' ? window.location.origin : '';
        const { error: registerError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${redirectBase}/auth/callback?next=/dashboard`,
          },
        });
        if (registerError) {
          setError(registerError.message);
          return;
        }

        setMessage('Registrazione inviata. Conferma la mail e verrai reindirizzato nella SaaS.');
        return;
      }

      if (mode === 'reset') {
        const redirectBase = typeof window !== 'undefined' ? window.location.origin : '';
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${redirectBase}/login?mode=update`,
        });
        if (resetError) {
          setError(resetError.message);
          return;
        }

        setMessage('Email per reset password inviata.');
        return;
      }

      const { error: updateError } = await supabase.auth.updatePassword(password);
      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage('Password aggiornata con successo. Ora puoi accedere.');
      setMode('login');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <section style={{ width: '100%', maxWidth: 460 }}>
        <h1>{title}</h1>

        <form onSubmit={submit}>
          {(mode !== 'update') && (
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          )}

          {mode !== 'reset' && (
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          )}

          <button disabled={loading} type="submit">
            {loading ? '...' : 'Submit'}
          </button>
        </form>

        {error && <p>{error}</p>}
        {message && <p>{message}</p>}
      </section>
    </main>
  );
}
