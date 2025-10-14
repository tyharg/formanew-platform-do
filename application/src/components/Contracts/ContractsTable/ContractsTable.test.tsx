import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ContractsTable from './ContractsTable';
import { Contract } from 'lib/api/contracts';

describe('ContractsTable', () => {
  const mockContracts: Contract[] = [
    {
      id: 'contract-1',
      companyId: 'company-1',
      title: 'Master Services Agreement',
      counterpartyName: 'Acme Corp',
      counterpartyEmail: 'legal@acme.com',
      contractValue: 50000,
      currency: 'USD',
      status: 'ACTIVE',
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-12-31T00:00:00.000Z',
      signedDate: '2024-12-15T00:00:00.000Z',
      paymentTerms: 'Net 30',
      renewalTerms: 'Auto renew',
      description: 'MSA for ongoing services',
      createdAt: '2024-12-10T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
    },
  ];

  const handlers = {
    onView: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes to contract details when a row is clicked', () => {
    render(<ContractsTable contracts={mockContracts} {...handlers} />);

    fireEvent.click(screen.getByRole('row', { name: /master services agreement/i }));
    expect(handlers.onView).toHaveBeenCalledWith(mockContracts[0]);
  });

  it('does not trigger row navigation when action buttons are used', () => {
    render(<ContractsTable contracts={mockContracts} {...handlers} />);

    fireEvent.click(screen.getByLabelText('Edit'));
    expect(handlers.onEdit).toHaveBeenCalledWith(mockContracts[0]);
    expect(handlers.onView).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Delete'));
    expect(handlers.onDelete).toHaveBeenCalledWith(mockContracts[0]);
  });
});
