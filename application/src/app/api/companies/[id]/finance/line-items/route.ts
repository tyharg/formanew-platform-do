import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

const parseLineItemPayload = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    throw new Error('Missing request body.');
  }

  const input = body as Record<string, unknown>;

  const type = input.type;
  if (type !== 'INFLOW' && type !== 'OUTFLOW') {
    throw new Error('type must be either "INFLOW" or "OUTFLOW".');
  }

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('amount must be a positive number.');
  }

  const currency = typeof input.currency === 'string' ? input.currency.trim().toLowerCase() : '';
  if (!currency) {
    throw new Error('currency is required (e.g., "usd").');
  }

  const occurredAtRaw = typeof input.occurredAt === 'string' ? input.occurredAt : '';
  const occurredAt = new Date(occurredAtRaw);
  if (!occurredAtRaw || Number.isNaN(occurredAt.getTime())) {
    throw new Error('occurredAt must be an ISO8601 timestamp.');
  }

  const description = typeof input.description === 'string' ? input.description.trim() : undefined;
  const category = typeof input.category === 'string' ? input.category.trim() : undefined;
  const notes = typeof input.notes === 'string' ? input.notes.trim() : undefined;

  return {
    type,
    amount,
    currency,
    occurredAt: occurredAt.toISOString(),
    description,
    category,
    notes,
  };
};

const listLineItems = async (
  _req: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string }>
) => {
  const { id: companyId } = await paramsPromise;
  const db = await createDatabaseService();

  const company = await db.company.findById(companyId);
  if (!company || company.userId !== user.id) {
    return NextResponse.json({ error: 'Company not found.' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  const items = await db.financeLineItem.findMany(companyId);
  return NextResponse.json({ items: items.map(serializeLineItem) }, { status: HTTP_STATUS.OK });
};

const createLineItem = async (
  request: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string }>
) => {
  const { id: companyId } = await paramsPromise;
  const body = await request.json().catch(() => ({}));

  try {
    const payload = parseLineItemPayload(body);
    const db = await createDatabaseService();

    const company = await db.company.findById(companyId);
    if (!company || company.userId !== user.id) {
      return NextResponse.json({ error: 'Company not found.' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const item = await db.financeLineItem.create(companyId, {
      type: payload.type,
      amount: BigInt(Math.round(payload.amount * 100)),
      currency: payload.currency,
      occurredAt: new Date(payload.occurredAt),
      description: payload.description ?? null,
      category: payload.category ?? null,
      notes: payload.notes ?? null,
    });

    return NextResponse.json({ item: serializeLineItem(item) }, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request payload.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.BAD_REQUEST });
  }
};

export const GET = withAuth(listLineItems);
export const POST = withAuth(createLineItem);


const serializeLineItem = (item: {
  id: string;
  companyId: string;
  type: 'INFLOW' | 'OUTFLOW';
  amount: bigint;
  currency: string;
  occurredAt: Date;
  description: string | null;
  category: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: item.id,
  companyId: item.companyId,
  type: item.type,
  amount: Number(item.amount) / 100,
  currency: item.currency,
  occurredAt: item.occurredAt.toISOString(),
  description: item.description,
  category: item.category,
  notes: item.notes,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});
