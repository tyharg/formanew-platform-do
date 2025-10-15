export interface FinanceLineItem {
  id: string;
  companyId: string;
  type: 'INFLOW' | 'OUTFLOW';
  amount: number;
  currency: string;
  occurredAt: string;
  description?: string | null;
  category?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceLineItemPayload {
  type: 'INFLOW' | 'OUTFLOW';
  amount: number;
  currency: string;
  occurredAt: string;
  description?: string;
  category?: string;
  notes?: string;
}

const withJson = async <T>(request: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(request, init);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload.error === 'string' ? payload.error : response.statusText;
    throw new Error(message);
  }
  return (await response.json()) as T;
};

export class CompanyFinanceLineItemsApiClient {
  constructor(private baseURL = '/api/companies') {}

  list(companyId: string): Promise<{ items: FinanceLineItem[] }> {
    return withJson<{ items: FinanceLineItem[] }>(`${this.baseURL}/${companyId}/finance/line-items`, {
      cache: 'no-store',
    });
  }

  create(companyId: string, payload: FinanceLineItemPayload): Promise<{ item: FinanceLineItem }> {
    return withJson<{ item: FinanceLineItem }>(`${this.baseURL}/${companyId}/finance/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  delete(companyId: string, itemId: string): Promise<{ success: true }> {
    return withJson<{ success: true }>(`${this.baseURL}/${companyId}/finance/line-items/${itemId}`, {
      method: 'DELETE',
    });
  }
}

export const financeLineItemsClient = new CompanyFinanceLineItemsApiClient();
