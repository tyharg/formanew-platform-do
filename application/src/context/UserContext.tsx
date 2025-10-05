'use client';
import React, { createContext, useState } from 'react';

interface UserState {
  user: string | null;
  setUser: (user: string | null) => void;
}

/**
 * Global user context.
 * Allows to save custom user information outside Auth.js.
 */
export const UserContext = createContext<UserState | undefined>(undefined);

/**
 * User context provider.
 * Exposes the user's name and a function to update it.
 *
 * @param children - Wrapped components that access the context.
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
