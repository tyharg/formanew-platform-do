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

const getWorkItems = async (
  _request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string }>
): Promise<NextResponse> => {
  const { id: contractId } = await paramsPromise;
  const access = await getContractIfAuthorized(contractId, user.id);
  if (!access.success) {
    return access.response;
  }

  try {
    const items = await access.dbClient.workItem.findByContractId(contractId);
    return NextResponse.json(
      { workItems: items.map(serializeWorkItem) },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('Failed to load work items:', error);
    return NextResponse.json(
      { error: 'Unable to load work items for this contract.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

const createWorkItem = async (
  request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string }>
): Promise<NextResponse> => {
  const { id: contractId } = await paramsPromise;
  const access = await getContractIfAuthorized(contractId, user.id);
  if (!access.success) {
    return access.response;
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch (error) {
    console.error('Invalid JSON body for work item create:', error);
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  if (!title) {
    return NextResponse.json(
      { error: 'Title is required.' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const descriptionInput = typeof payload.description === 'string' ? payload.description.trim() : null;
  const description = descriptionInput ? descriptionInput : null;
  const status = isValidStatus(payload.status) ? (payload.status as WorkItemStatus) : WorkItemStatus.NOT_STARTED;
  const dueDate = parseDateInput(payload.dueDate);
  const linkedFileId = typeof payload.linkedFileId === 'string' && payload.linkedFileId.trim()
    ? payload.linkedFileId.trim()
    : null;

  if (linkedFileId) {
    const file = await access.dbClient.file.findById(linkedFileId);
    if (!file || file.contractId !== contractId) {
      return NextResponse.json(
        { error: 'Linked file was not found for this contract.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
  }

  const existingItems = await access.dbClient.workItem.findByContractId(contractId);
  let position: number;
  if (typeof payload.position === 'number' && Number.isFinite(payload.position)) {
    position = Math.max(0, Math.floor(payload.position));
  } else if (existingItems.length === 0) {
    position = 0;
  } else {
    position = Math.max(...existingItems.map((item) => item.position)) + 1;
  }

  const completedAt =
    status === WorkItemStatus.COMPLETED ? new Date() : null;

  try {
    const created = await access.dbClient.workItem.create({
      contractId,
      title,
      description,
      status,
      dueDate,
      completedAt,
      position,
      linkedFileId,
    } as Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>);

    return NextResponse.json(
      { workItem: serializeWorkItem(created) },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Failed to create work item:', error);
    return NextResponse.json(
      { error: 'Unable to create work item right now.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

export const GET = withAuth(getWorkItems);
export const POST = withAuth(createWorkItem);
