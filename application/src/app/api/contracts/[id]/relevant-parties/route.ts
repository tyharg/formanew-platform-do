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

const getRelevantParties = async (
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
    const parties = await access.dbClient.relevantParty.findByContractId(contractId);
    return NextResponse.json(
      { relevantParties: parties.map(serializeRelevantParty) },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('Failed to load relevant parties:', error);
    return NextResponse.json(
      { error: 'Unable to load relevant parties right now.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

const createRelevantParty = async (
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
    console.error('Invalid JSON body for relevant party create:', error);
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const fullName = typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
  if (!fullName) {
    return NextResponse.json(
      { error: 'Full name is required.' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!email) {
    return NextResponse.json(
      { error: 'Email is required.' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : null;
  const role = typeof payload.role === 'string' ? payload.role.trim() : null;
  const notes = typeof payload.notes === 'string' ? payload.notes.trim() : null;

  const magicLinkToken = null;
  const magicLinkExpiresAt = null;

  try {
    const created = await access.dbClient.relevantParty.create({
      contractId,
      fullName,
      email,
      phone,
      role,
      notes,
      magicLinkToken,
      magicLinkExpiresAt,
    } as Omit<RelevantParty, 'id' | 'createdAt' | 'updatedAt'>);

    return NextResponse.json(
      { relevantParty: serializeRelevantParty(created) },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Failed to create relevant party:', error);
    const message =
      error instanceof Error && error.message.includes('Unique constraint')
        ? 'A party with this email already exists for this contract.'
        : 'Unable to create relevant party right now.';

    return NextResponse.json(
      { error: message },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

export const GET = withAuth(getRelevantParties);
export const POST = withAuth(createRelevantParty);
