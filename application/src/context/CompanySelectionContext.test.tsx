import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CompanySelectionProvider, useCompanySelection } from './CompanySelectionContext';
import type { Company } from 'lib/api/companies';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockUseSession = useSession as unknown as jest.Mock;

const mockGetCompanies = jest.fn();

jest.mock('lib/api/companies', () => {
  return {
    CompaniesApiClient: jest.fn().mockImplementation(() => ({
      getCompanies: mockGetCompanies,
    })),
  };
});

const TestConsumer = () => {
  const { selectedCompanyId, isLoading } = useCompanySelection();

  if (isLoading) {
    return <div data-testid="state">loading</div>;
  }

  return <div data-testid="state">{selectedCompanyId ?? 'none'}</div>;
};

describe('CompanySelectionProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });
    const companies: Company[] = [
      {
        id: 'company-1',
        userId: 'user-1',
        legalName: 'Company One LLC',
        displayName: 'Company One',
        industry: null,
        ein: null,
        formationDate: null,
        website: null,
        phone: null,
        email: null,
        addressLine1: null,
        addressLine2: null,
        city: null,
        state: null,
        postalCode: null,
        country: null,
        description: null,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'company-2',
        userId: 'user-1',
        legalName: 'Company Two LLC',
        displayName: 'Company Two',
        industry: null,
        ein: null,
        formationDate: null,
        website: null,
        phone: null,
        email: null,
        addressLine1: null,
        addressLine2: null,
        city: null,
        state: null,
        postalCode: null,
        country: null,
        description: null,
        createdAt: '',
        updatedAt: '',
      },
    ];
    mockGetCompanies.mockResolvedValue(companies);
  });

  it('selects the default company when companies load', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
          image: null,
          defaultCompanyId: 'company-2',
        },
      },
      status: 'authenticated',
    });

    render(
      <CompanySelectionProvider>
        <TestConsumer />
      </CompanySelectionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('company-2');
    });
  });

  it('falls back to the stored company when there is no default', async () => {
    localStorage.setItem('formanew:selectedCompanyId:user-1', 'company-1');

    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER',
          image: null,
          defaultCompanyId: null,
        },
      },
      status: 'authenticated',
    });

    render(
      <CompanySelectionProvider>
        <TestConsumer />
      </CompanySelectionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('company-1');
    });
  });
});
