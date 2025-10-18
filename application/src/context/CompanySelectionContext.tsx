'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CompaniesApiClient, Company } from 'lib/api/companies';

const STORAGE_KEY_PREFIX = 'formanew:selectedCompanyId';

const getStorageKey = (userId: string | null) =>
  userId ? `${STORAGE_KEY_PREFIX}:${userId}` : STORAGE_KEY_PREFIX;

const getStoredCompanyId = (userId: string | null): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(getStorageKey(userId));
};

interface CompanySelectionContextValue {
  companies: Company[];
  selectedCompanyId: string | null;
  selectedCompany: Company | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  selectCompany: (companyId: string | null) => void;
  refreshCompanies: () => Promise<void>;
}

const CompanySelectionContext = createContext<CompanySelectionContextValue | undefined>(undefined);

const companiesClient = new CompaniesApiClient();

export const CompanySelectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const defaultCompanyId = session?.user?.defaultCompanyId ?? null;
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (previousUserIdRef.current === userId) {
      return;
    }

    previousUserIdRef.current = userId;
    setHasUserSelected(false);
    setSelectedCompanyId(null);
    setCompanies([]);
    setError(null);
    setIsLoading(true);
    setIsRefreshing(false);
  }, [userId]);

  useEffect(() => {
    setHasUserSelected(false);
  }, [defaultCompanyId]);

  const resolveSelection = useCallback(
    (nextCompanies: Company[]) => {
      setSelectedCompanyId((previous) => {
        const isValidCompanyId = (companyId: string | null | undefined) =>
          Boolean(companyId) && nextCompanies.some((company) => company.id === companyId);

        if (!hasUserSelected && isValidCompanyId(defaultCompanyId)) {
          return defaultCompanyId;
        }

        if (previous && isValidCompanyId(previous)) {
          return previous;
        }

        if (!hasUserSelected) {
          const storedId = getStoredCompanyId(userId);
          if (isValidCompanyId(storedId)) {
            return storedId;
          }
        }

        return nextCompanies[0]?.id ?? null;
      });
    },
    [defaultCompanyId, hasUserSelected, userId]
  );

  const loadCompanies = useCallback(async () => {
    if (!userId) {
      setCompanies([]);
      setSelectedCompanyId(null);
      setIsLoading(false);
      setIsRefreshing(false);
      setError(null);
      return;
    }

    setError(null);
    setIsRefreshing(true);
    try {
      const companyList = await companiesClient.getCompanies();
      setCompanies(companyList);
      resolveSelection(companyList);
    } catch (err) {
      console.error('Failed to load companies', err);
      setCompanies([]);
      setSelectedCompanyId(null);
      setError('Unable to load companies.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [resolveSelection, userId]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (companies.length > 0) {
      resolveSelection(companies);
    }
  }, [companies, resolveSelection]);

  const selectCompany = useCallback(
    (companyId: string | null) => {
      setHasUserSelected(true);
      setSelectedCompanyId((previous) => {
        if (companyId && !companies.some((company) => company.id === companyId)) {
          return previous;
        }
        return companyId;
      });
    },
    [companies]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) {
      return;
    }

    const storageKey = getStorageKey(userId);
    if (selectedCompanyId) {
      localStorage.setItem(storageKey, selectedCompanyId);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [isLoading, selectedCompanyId, userId]);

  const contextValue = useMemo<CompanySelectionContextValue>(() => {
    const selectedCompany = selectedCompanyId
      ? companies.find((company) => company.id === selectedCompanyId) ?? null
      : null;

    return {
      companies,
      selectedCompanyId,
      selectedCompany,
      isLoading,
      isRefreshing,
      error,
      selectCompany,
      refreshCompanies: loadCompanies,
    };
  }, [companies, selectedCompanyId, isLoading, isRefreshing, error, selectCompany, loadCompanies]);

  return (
    <CompanySelectionContext.Provider value={contextValue}>
      {children}
    </CompanySelectionContext.Provider>
  );
};

export const useCompanySelection = () => {
  const context = useContext(CompanySelectionContext);
  if (!context) {
    throw new Error('useCompanySelection must be used within a CompanySelectionProvider');
  }
  return context;
};
