'use client';

import { createContext, useState } from 'react';

/**
 * Global context to handle the navigation state (`navigating`).
 * Allows to show loaders during transitions or controlled requests.
 */
export const NavigatingContext = createContext<{
  navigating: boolean;
  setNavigating: (value: boolean) => void;
}>({ navigating: false, setNavigating: () => {} });

/**
 * Navigation context provider.
 * Provides `navigating` state and `setNavigating` function to the whole app.
 *
 * @param children - Child components that will be able to access the context.
 */
export const NavigatingProvider = ({ children }: { children: React.ReactNode }) => {
  const [navigating, setNavigating] = useState(false);

  return (
    <NavigatingContext.Provider value={{ navigating, setNavigating }}>
      {children}
    </NavigatingContext.Provider>
  );
};
