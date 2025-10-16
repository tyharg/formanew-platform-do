export type ContractStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PENDING_SIGNATURE'
  | 'COMPLETED'
  | 'TERMINATED';

export interface Contract {
  id: string;
  companyId: string;
  title: string;
  counterpartyName: string;
  counterpartyEmail: string | null;
  contractValue: number | null;
  currency: string | null;
  status: ContractStatus;
  startDate: string | null;
  endDate: string | null;
  signedDate: string | null;
  paymentTerms: string | null;
  renewalTerms: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  isBillingEnabled: boolean;
  stripePriceId: string | null;
  billingAmount: number | null;
  billingCurrency: string | null;
}

export interface CreateContractPayload {
  companyId: string;
  title: string;
  counterpartyName: string;
  counterpartyEmail?: string | null;
  contractValue?: number | string | null;
  currency?: string | null;
  status?: ContractStatus;
  startDate?: string | null;
  endDate?: string | null;
  signedDate?: string | null;
  paymentTerms?: string | null;
  renewalTerms?: string | null;
  description?: string | null;
}

export type UpdateContractPayload = Partial<CreateContractPayload> & {
  isBillingEnabled?: boolean;
  stripePriceId?: string | null;
  billingAmount?: number | null;
  billingCurrency?: string | null;
};

export const CONTRACT_STATUS_OPTIONS: ContractStatus[] = [
  'DRAFT',
  'ACTIVE',
  'PENDING_SIGNATURE',
  'COMPLETED',
  'TERMINATED',
];

export class ContractsApiClient {
  constructor(private baseURL = '/api/contracts') {}

  async getContracts(companyId: string): Promise<Contract[]> {
    const query = new URLSearchParams({ companyId }).toString();
    const res = await fetch(`${this.baseURL}?${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch contracts');
    const data = await res.json();
    return data.contracts as Contract[];
  }

  async getContract(id: string): Promise<Contract> {
    const res = await fetch(`${this.baseURL}/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch contract');
    const data = await res.json();
    return data.contract as Contract;
  }

  async createContract(payload: CreateContractPayload): Promise<Contract> {
    const res = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create contract');
    const data = await res.json();
    return data.contract as Contract;
  }

  async updateContract(id: string, payload: UpdateContractPayload): Promise<Contract> {
    const res = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update contract');
    const data = await res.json();
    return data.contract as Contract;
  }

  async deleteContract(id: string): Promise<void> {
    const res = await fetch(`${this.baseURL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete contract');
  }
}
