export const dynamic = "force-dynamic";

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

    const unsub = supabase.auth.onAuthStateChange((event) => {
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
      unsub.data.subscription.unsubscribe();
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
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'radial-gradient(circle at top,#152753,#090e1d 45%)',
        padding: 16,
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 18,
          background: '#101936',
          border: '1px solid #2a3b73',
          boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
          padding: 24,
          color: '#fff',
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: 28 }}>{title}</h1>
        <p style={{ opacity: 0.78, marginBottom: 18 }}>
          Login completo con Supabase: accesso, registrazione, conferma email e recupero password.
        </p>

        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <label style={{ display: 'grid', gap: 5 }}>
              <span style={{ fontSize: 14, opacity: 0.86 }}>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com"
                style={{ borderRadius: 10, border: '1px solid #3a4f8e', padding: '10px 12px', background: '#0b1230', color: '#fff' }}
              />
            </label>
          )}

          {mode !== 'reset' && (
            <label style={{ display: 'grid', gap: 5 }}>
              <span style={{ fontSize: 14, opacity: 0.86 }}>{mode === 'update' ? 'Nuova password' : 'Password'}</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                style={{ borderRadius: 10, border: '1px solid #3a4f8e', padding: '10px 12px', background: '#0b1230', color: '#fff' }}
              />
            </label>
          )}

          <button
            disabled={loading}
            type="submit"
            style={{
              marginTop: 6,
              border: 'none',
              borderRadius: 12,
              padding: '11px 13px',
              background: '#3556ff',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {loading
              ? 'Attendere...'
              : mode === 'login'
                ? 'Accedi'
                : mode === 'register'
                  ? 'Registrati'
                  : mode === 'reset'
                    ? 'Invia reset'
                    : 'Aggiorna password'}
          </button>
        </form>

        {error && (
          <p style={{ marginTop: 12, color: '#ff8e8e', background: '#3a1414', padding: 10, borderRadius: 10 }}>{error}</p>
        )}

        {message && (
          <p style={{ marginTop: 12, color: '#9ee6b1', background: '#143022', padding: 10, borderRadius: 10 }}>{message}</p>
        )}

        {mode !== 'update' && (
          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setMode('login')}
              style={{ border: '1px solid #31447d', background: mode === 'login' ? '#263b80' : 'transparent', color: '#fff', borderRadius: 20, padding: '7px 11px' }}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              style={{ border: '1px solid #31447d', background: mode === 'register' ? '#263b80' : 'transparent', color: '#fff', borderRadius: 20, padding: '7px 11px' }}
            >
              Registrazione
            </button>
            <button
              onClick={() => setMode('reset')}
              style={{ border: '1px solid #31447d', background: mode === 'reset' ? '#263b80' : 'transparent', color: '#fff', borderRadius: 20, padding: '7px 11px' }}
            >
              Password dimenticata
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
