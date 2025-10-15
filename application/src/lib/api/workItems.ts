export type WorkItemStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';

export interface WorkItemRecord {
  id: string;
  contractId: string;
  title: string;
  description: string | null;
  status: WorkItemStatus;
  dueDate: string | null;
  completedAt: string | null;
  position: number;
  linkedFileId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkItemPayload {
  title: string;
  description?: string | null;
  status?: WorkItemStatus;
  dueDate?: string | null;
  position?: number;
  linkedFileId?: string | null;
}

export type UpdateWorkItemPayload = Partial<CreateWorkItemPayload> & {
  completedAt?: string | null;
};

export const WORK_ITEM_STATUS_OPTIONS: WorkItemStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'BLOCKED',
  'COMPLETED',
];

export class WorkItemsApiClient {
  constructor(private baseURL = '/api/contracts') {}

  async list(contractId: string): Promise<WorkItemRecord[]> {
    const res = await fetch(`${this.baseURL}/${contractId}/work-items`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to load work items');
    }
    const data = await res.json();
    return (data.workItems ?? []) as WorkItemRecord[];
  }

  async create(contractId: string, payload: CreateWorkItemPayload): Promise<WorkItemRecord> {
    const res = await fetch(`${this.baseURL}/${contractId}/work-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = typeof data.error === 'string' ? data.error : 'Failed to create work item';
      throw new Error(message);
    }

    return data.workItem as WorkItemRecord;
  }

  async update(
    contractId: string,
    workItemId: string,
    payload: UpdateWorkItemPayload
  ): Promise<WorkItemRecord> {
    const res = await fetch(`${this.baseURL}/${contractId}/work-items/${workItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = typeof data.error === 'string' ? data.error : 'Failed to update work item';
      throw new Error(message);
    }

    return data.workItem as WorkItemRecord;
  }

  async delete(contractId: string, workItemId: string): Promise<void> {
    const res = await fetch(`${this.baseURL}/${contractId}/work-items/${workItemId}`, {
      method: 'DELETE',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = typeof data.error === 'string' ? data.error : 'Failed to delete work item';
      throw new Error(message);
    }
  }
}
