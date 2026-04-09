'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const nextPath = searchParams.get('next') || '/dashboard';

    async function completeAuth() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
        if (typeof window !== 'undefined') {
          document.cookie = 'betting_saas_auth=1; path=/; max-age=2592000; samesite=lax';
        }
      }

      router.replace(nextPath);
    }

    completeAuth();
  }, [router, searchParams]);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a1020', color: '#f6f8ff' }}>
      Conferma account in corso...
    </main>
  );
}
