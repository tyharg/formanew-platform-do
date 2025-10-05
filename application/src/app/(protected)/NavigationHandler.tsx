'use client';

import { useNavigating } from 'hooks/navigation';
import { useEffect } from 'react';

/**
 * Client component to handle navigation state.
 * Separated from the main layout to keep the layout as a server component.
 */
export default function NavigationHandler() {
  const { setNavigating } = useNavigating();

  useEffect(() => {
    setNavigating(false);
  }, [setNavigating]);

  return null; // This component doesn't render anything
}