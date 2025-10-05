'use client';

import { NavigatingContext } from 'context/Navigation';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

/**
 * Hook to access the global navigation state (`navigating`).
 * Useful to show or hide loading spinners.
 *
 * @returns `{ navigating, setNavigating }` object from context.
 */
export const useNavigating = () => useContext(NavigatingContext);

/**
 * Custom hook to browse with prefetch in Next.js App Router.
 * Try to prefetch route before doing `router.push`.
 *
 * @returns Object with `navigate(href)` method for prefetch navigation.
 */
export const usePrefetchRouter = () => {
  const router = useRouter();
  const { setNavigating } = useNavigating();

  const navigate = async (href: string) => {
    try {
      setNavigating(true);
      await router.prefetch(href);
    } catch (err) {
      console.warn(`Prefetch failed for ${href}`, err);
    }
    router.push(href);
  };

  return { navigate };
};
