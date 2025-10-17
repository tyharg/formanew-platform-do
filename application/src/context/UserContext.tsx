'use client';
import React, { createContext, useState, useContext } from 'react';
import { User, Company } from '@/types';

interface UserState {
  user: User | null;
  company: Company | null;
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
}

export const UserContext = createContext<UserState | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser, company, setCompany }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
