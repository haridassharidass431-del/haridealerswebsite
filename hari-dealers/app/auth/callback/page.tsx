'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let active = true;
    const finishSignIn = async () => {
      if (!supabase) {
        router.replace('/login');
        return;
      }
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error || !data.session) {
        router.replace('/login?error=google_auth_failed');
        return;
      }
      const next = searchParams.get('next') || '/account';
      router.replace(next.startsWith('/') && !next.startsWith('//') ? next : '/account');
    };
    void finishSignIn();
    return () => { active = false; };
  }, [router, searchParams]);

  return <div className="min-h-[60vh] flex items-center justify-center text-sm text-charcoal-600">Finishing Google sign-in…</div>;
}

export default function AuthCallbackPage() {
  return <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Finishing Google sign-in…</div>}><AuthCallbackContent /></Suspense>;
}
