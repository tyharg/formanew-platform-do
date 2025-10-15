export interface RelevantPartyRecord {
  id: string;
  contractId: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string | null;
  notes: string | null;
  magicLinkToken: string | null;
  magicLinkExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRelevantPartyPayload {
  fullName: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  notes?: string | null;
}

export type UpdateRelevantPartyPayload = Partial<CreateRelevantPartyPayload> & {
  magicLinkToken?: string | null;
  magicLinkExpiresAt?: string | null;
};

export class RelevantPartiesApiClient {
  constructor(private baseURL = '/api/contracts') {}

  async list(contractId: string): Promise<RelevantPartyRecord[]> {
    const res = await fetch(`${this.baseURL}/${contractId}/relevant-parties`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to load relevant parties');
    }
    const data = await res.json();
    return (data.relevantParties ?? []) as RelevantPartyRecord[];
  }

  async create(contractId: string, payload: CreateRelevantPartyPayload): Promise<RelevantPartyRecord> {
    const res = await fetch(`${this.baseURL}/${contractId}/relevant-parties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = typeof data.error === 'string' ? data.error : 'Failed to create relevant party';
      throw new Error(message);
    }

    return data.relevantParty as RelevantPartyRecord;
  }

  async update(
    contractId: string,
    partyId: string,
    payload: UpdateRelevantPartyPayload
  ): Promise<RelevantPartyRecord> {
    const res = await fetch(`${this.baseURL}/${contractId}/relevant-parties/${partyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = typeof data.error === 'string' ? data.error : 'Failed to update relevant party';
      throw new Error(message);
    }

    return data.relevantParty as RelevantPartyRecord;
  }

  async delete(contractId: string, partyId: string): Promise<void> {
    const res = await fetch(`${this.baseURL}/${contractId}/relevant-parties/${partyId}`, {
      method: 'DELETE',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = typeof data.error === 'string' ? data.error : 'Failed to delete relevant party';
      throw new Error(message);
    }
  }
}
