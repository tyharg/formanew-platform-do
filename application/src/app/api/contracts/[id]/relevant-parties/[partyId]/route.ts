import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';
import { RelevantParty } from 'types';

const serializeRelevantParty = (party: RelevantParty) => ({
  ...party,
  magicLinkExpiresAt: party.magicLinkExpiresAt ? party.magicLinkExpiresAt.toISOString() : null,
  createdAt: party.createdAt.toISOString(),
  updatedAt: party.updatedAt.toISOString(),
});

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
): Promise<
  | { success: true; dbClient: Awaited<ReturnType<typeof createDatabaseService>> }
  | { success: false; response: NextResponse }
> => {
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

const updateRelevantParty = async (
  request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string; partyId: string }>
): Promise<NextResponse> => {
  const { id: contractId, partyId } = await paramsPromise;
  const access = await getContractIfAuthorized(contractId, user.id);
  if (!access.success) {
    return access.response;
  }

  const existing = await access.dbClient.relevantParty.findById(partyId);
  if (!existing || existing.contractId !== contractId) {
    return NextResponse.json({ error: 'Relevant party not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch (error) {
    console.error('Invalid JSON body for relevant party update:', error);
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const updates: Partial<Omit<RelevantParty, 'id' | 'contractId' | 'createdAt' | 'updatedAt'>> = {};

  if (payload.fullName !== undefined) {
    if (typeof payload.fullName !== 'string' || !payload.fullName.trim()) {
      return NextResponse.json(
        { error: 'Full name cannot be empty.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    updates.fullName = payload.fullName.trim();
  }

  if (payload.email !== undefined) {
    if (typeof payload.email !== 'string' || !payload.email.trim()) {
      return NextResponse.json(
        { error: 'Email cannot be empty.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    updates.email = payload.email.trim().toLowerCase();
  }

  if (payload.phone !== undefined) {
    updates.phone = typeof payload.phone === 'string' ? payload.phone.trim() || null : null;
  }

  if (payload.role !== undefined) {
    updates.role = typeof payload.role === 'string' ? payload.role.trim() || null : null;
  }

  if (payload.notes !== undefined) {
    updates.notes = typeof payload.notes === 'string' ? payload.notes.trim() || null : null;
  }

  if (payload.magicLinkToken !== undefined) {
    if (payload.magicLinkToken === null || payload.magicLinkToken === '') {
      updates.magicLinkToken = null;
    } else if (typeof payload.magicLinkToken === 'string') {
      updates.magicLinkToken = payload.magicLinkToken.trim();
    } else {
      return NextResponse.json(
        { error: 'Invalid magic link token value.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
  }

  if (payload.magicLinkExpiresAt !== undefined) {
    updates.magicLinkExpiresAt = parseDateInput(payload.magicLinkExpiresAt);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ relevantParty: serializeRelevantParty(existing) }, { status: HTTP_STATUS.OK });
  }

  try {
    const updated = await access.dbClient.relevantParty.update(partyId, updates);
    return NextResponse.json({ relevantParty: serializeRelevantParty(updated) }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to update relevant party:', error);
    const message =
      error instanceof Error && error.message.includes('Unique constraint')
        ? 'This email is already assigned to another party on this contract.'
        : 'Unable to update relevant party right now.';

    return NextResponse.json(
      { error: message },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

const deleteRelevantParty = async (
  _request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string; partyId: string }>
): Promise<NextResponse> => {
  const { id: contractId, partyId } = await paramsPromise;
  const access = await getContractIfAuthorized(contractId, user.id);
  if (!access.success) {
    return access.response;
  }

  const existing = await access.dbClient.relevantParty.findById(partyId);
  if (!existing || existing.contractId !== contractId) {
    return NextResponse.json({ error: 'Relevant party not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    await access.dbClient.relevantParty.delete(partyId);
    return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to delete relevant party:', error);
    return NextResponse.json(
      { error: 'Unable to delete relevant party right now.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

export const PATCH = withAuth(updateRelevantParty);
export const DELETE = withAuth(deleteRelevantParty);
