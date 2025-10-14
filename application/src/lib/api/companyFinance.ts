export interface CompanyFinance {
  id: string;
  companyId: string;
  stripeAccountId: string | null;
  accountOnboardingUrl: string | null;
  accountOnboardingExpiresAt: string | null;
  accountLoginLinkUrl: string | null;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirementsDue: string[];
  requirementsDueSoon: string[];
  createdAt: string;
  updatedAt: string;
}

export type CompanyFinancePayload = {
  stripeAccountId?: string | null;
  accountOnboardingUrl?: string | null;
  accountOnboardingExpiresAt?: string | null;
  accountLoginLinkUrl?: string | null;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  requirementsDue?: string[];
  requirementsDueSoon?: string[];
};

export class CompanyFinanceApiClient {
  constructor(private baseURL = '/api/companies') {}

  async getFinance(companyId: string): Promise<CompanyFinance | null> {
    const res = await fetch(`${this.baseURL}/${companyId}/finance`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch company finance details');
    }

    const data = await res.json();
    return (data.finance as CompanyFinance | null) ?? null;
  }

  async createFinance(
    companyId: string,
    payload: CompanyFinancePayload = {}
  ): Promise<CompanyFinance> {
    const res = await fetch(`${this.baseURL}/${companyId}/finance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Failed to create company finance record');
    }

    const data = await res.json();
    return data.finance as CompanyFinance;
  }

  async updateFinance(
    companyId: string,
    payload: CompanyFinancePayload
  ): Promise<CompanyFinance> {
    const res = await fetch(`${this.baseURL}/${companyId}/finance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Failed to update company finance record');
    }

    const data = await res.json();
    return data.finance as CompanyFinance;
  }
}
