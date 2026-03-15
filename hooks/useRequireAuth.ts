'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/** Redirects to /auth if not logged in. Use in protected pages. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for AuthContext to finish hydrating from localStorage before redirecting
    if (loading) return;
    if (!user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  return { user, loading };
}
