'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CompaniesApiClient, Company } from 'lib/api/companies';

const STORAGE_KEY = 'formanew:selectedCompanyId';

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

const getStoredCompanyId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(STORAGE_KEY);
};

export const CompanySelectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const { data: session } = useSession();
  const defaultCompanyId = session?.user?.defaultCompanyId ?? null;

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
          const storedId = getStoredCompanyId();
          if (isValidCompanyId(storedId)) {
            return storedId;
          }
        }

        return nextCompanies[0]?.id ?? null;
      });
    },
    [defaultCompanyId, hasUserSelected]
  );

  const loadCompanies = useCallback(async () => {
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
  }, [resolveSelection]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (companies.length > 0) {
      resolveSelection(companies);
    }
  }, [companies, resolveSelection]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (selectedCompanyId) {
      localStorage.setItem(STORAGE_KEY, selectedCompanyId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedCompanyId]);

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
