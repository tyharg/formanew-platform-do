import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';
import { WorkItem, WorkItemStatus } from 'types';

const serializeWorkItem = (item: WorkItem) => ({
  ...item,
  dueDate: item.dueDate ? item.dueDate.toISOString() : null,
  completedAt: item.completedAt ? item.completedAt.toISOString() : null,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});

const isValidStatus = (value: unknown): value is WorkItemStatus =>
  typeof value === 'string' && (Object.values(WorkItemStatus) as string[]).includes(value);

const parseDateInput = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getContractIfAuthorized = async (
  contractId: string,
  userId: string
): Promise<{ success: true; dbClient: Awaited<ReturnType<typeof createDatabaseService>> } | {
  success: false;
  response: NextResponse;
}> => {
  try {
    const dbClient = await createDatabaseService();
    const contract = await dbClient.contract.findById(contractId);
    if (!contract) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND }),
      };
    }

    const company = await dbClient.company.findById(contract.companyId);
    if (!company || company.userId !== userId) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND }),
      };
    }

    return { success: true, dbClient };
  } catch (error) {
    console.error('Failed to verify contract ownership:', error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Unable to verify contract ownership.' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      ),
    };
  }
};

const updateWorkItem = async (
  request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string; workItemId: string }>
): Promise<NextResponse> => {
  const { id: contractId, workItemId } = await paramsPromise;
  const access = await getContractIfAuthorized(contractId, user.id);
  if (!access.success) {
    return access.response;
  }

  const existing = await access.dbClient.workItem.findById(workItemId);
  if (!existing || existing.contractId !== contractId) {
    return NextResponse.json({ error: 'Work item not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch (error) {
    console.error('Invalid JSON body for work item update:', error);
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const updates: Partial<Omit<WorkItem, 'id' | 'contractId' | 'createdAt' | 'updatedAt'>> = {};

  if (typeof payload.title === 'string') {
    const title = payload.title.trim();
    if (!title) {
      return NextResponse.json(
        { error: 'Title cannot be empty.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    updates.title = title;
  }

  if (typeof payload.description === 'string') {
    const trimmedDescription = payload.description.trim();
    updates.description = trimmedDescription ? trimmedDescription : null;
  } else if (payload.description === null) {
    updates.description = null;
  }

  if (payload.status !== undefined) {
    if (!isValidStatus(payload.status)) {
      return NextResponse.json(
        { error: 'Invalid status value.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    const status = payload.status as WorkItemStatus;
    updates.status = status;
    if (status === WorkItemStatus.COMPLETED) {
      updates.completedAt = payload.completedAt ? parseDateInput(payload.completedAt) ?? undefined : new Date();
    } else if (payload.completedAt !== undefined) {
      updates.completedAt = parseDateInput(payload.completedAt);
    } else {
      updates.completedAt = null;
    }
  } else if (payload.completedAt !== undefined) {
    updates.completedAt = parseDateInput(payload.completedAt);
  }

  if (payload.dueDate !== undefined) {
    updates.dueDate = parseDateInput(payload.dueDate);
  }

  if (payload.position !== undefined) {
    if (typeof payload.position !== 'number' || !Number.isFinite(payload.position)) {
      return NextResponse.json(
        { error: 'Position must be a number.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    updates.position = Math.max(0, Math.floor(payload.position));
  }

  if (payload.linkedFileId !== undefined) {
    if (payload.linkedFileId === null || payload.linkedFileId === '') {
      updates.linkedFileId = null;
    } else if (typeof payload.linkedFileId === 'string') {
      const linkedFileId = payload.linkedFileId.trim();
      const file = await access.dbClient.file.findById(linkedFileId);
      if (!file || file.contractId !== contractId) {
        return NextResponse.json(
          { error: 'Linked file was not found for this contract.' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      updates.linkedFileId = linkedFileId;
    } else {
      return NextResponse.json(
        { error: 'Invalid linked file identifier.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ workItem: serializeWorkItem(existing) }, { status: HTTP_STATUS.OK });
  }

  try {
    const updated = await access.dbClient.workItem.update(workItemId, updates);
    return NextResponse.json({ workItem: serializeWorkItem(updated) }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to update work item:', error);
    return NextResponse.json(
      { error: 'Unable to update work item right now.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

const deleteWorkItem = async (
  _request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string; workItemId: string }>
): Promise<NextResponse> => {
  const { id: contractId, workItemId } = await paramsPromise;
  const access = await getContractIfAuthorized(contractId, user.id);
  if (!access.success) {
    return access.response;
  }

  const existing = await access.dbClient.workItem.findById(workItemId);
  if (!existing || existing.contractId !== contractId) {
    return NextResponse.json({ error: 'Work item not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    await access.dbClient.workItem.delete(workItemId);
    return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to delete work item:', error);
    return NextResponse.json(
      { error: 'Unable to delete work item right now.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

export const PATCH = withAuth(updateWorkItem);
export const DELETE = withAuth(deleteWorkItem);
