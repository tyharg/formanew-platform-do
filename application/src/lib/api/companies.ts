export interface Company {
  id: string;
  userId: string;
  legalName: string;
  displayName: string | null;
  industry: string | null;
  ein: string | null;
  formationDate: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  contracts?: CompanyContractSummary[];
  contacts?: CompanyContact[];
  notes?: CompanyNote[];
}

export interface CompanyContractSummary {
  id: string;
  title: string;
  status: string;
  contractValue: number | null;
  currency: string | null;
  updatedAt: string;
}

export interface CompanyContact {
  id: string;
  companyId: string;
  fullName: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyNote {
  id: string;
  companyId: string;
  authorName: string | null;
  content: string;
  createdAt: string;
}

export type CreateCompanyPayload = Pick<Company, 'legalName'> &
  Partial<
    Omit<
      Company,
      'id' | 'userId' | 'legalName' | 'createdAt' | 'updatedAt' | 'contracts' | 'contacts' | 'notes'
    >
  > & { formationDate?: string | null };

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

export type CreateCompanyContactPayload = Pick<CompanyContact, 'companyId' | 'fullName'> &
  Partial<Omit<CompanyContact, 'id' | 'companyId' | 'fullName' | 'createdAt' | 'updatedAt'>>;

export type UpdateCompanyContactPayload = Partial<
  Omit<CompanyContact, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
>;

export type CreateCompanyNotePayload = {
  companyId: string;
  authorName?: string | null;
  content: string;
};

export class CompaniesApiClient {
  constructor(private baseURL = '/api/companies') {}

  async getCompanies(): Promise<Company[]> {
    const res = await fetch(this.baseURL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch companies');
    const data = await res.json();
    return data.companies as Company[];
  }

  async getCompany(id: string): Promise<Company> {
    const res = await fetch(`${this.baseURL}/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch company');
    const data = await res.json();
    return data.company as Company;
  }

  async createCompany(payload: CreateCompanyPayload): Promise<Company> {
    const res = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create company');
    const data = await res.json();
    return data.company as Company;
  }

  async updateCompany(id: string, payload: UpdateCompanyPayload): Promise<Company> {
    const res = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update company');
    const data = await res.json();
    return data.company as Company;
  }

  async deleteCompany(id: string): Promise<void> {
    const res = await fetch(`${this.baseURL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete company');
  }

  async createContact(payload: CreateCompanyContactPayload): Promise<CompanyContact> {
    const { companyId, ...rest } = payload;
    const res = await fetch(`${this.baseURL}/${companyId}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rest),
    });
    if (!res.ok) throw new Error('Failed to create contact');
    const data = await res.json();
    return data.contact as CompanyContact;
  }

  async updateContact(
    companyId: string,
    contactId: string,
    payload: UpdateCompanyContactPayload
  ): Promise<CompanyContact> {
    const res = await fetch(`${this.baseURL}/${companyId}/contacts/${contactId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update contact');
    const data = await res.json();
    return data.contact as CompanyContact;
  }

  async deleteContact(companyId: string, contactId: string): Promise<void> {
    const res = await fetch(`${this.baseURL}/${companyId}/contacts/${contactId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete contact');
  }

  async createNote(payload: CreateCompanyNotePayload): Promise<CompanyNote> {
    const res = await fetch(`${this.baseURL}/${payload.companyId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: payload.authorName, content: payload.content }),
    });
    if (!res.ok) throw new Error('Failed to create note');
    const data = await res.json();
    return data.note as CompanyNote;
  }

  async deleteNote(companyId: string, noteId: string): Promise<void> {
    const res = await fetch(`${this.baseURL}/${companyId}/notes/${noteId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete note');
  }
}
