import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createStorageService } from 'services/storage/storageFactory';
import { HTTP_STATUS } from 'lib/api/http';
import { verifyClientPortalToken } from 'lib/auth/clientPortalToken';

const STORAGE_FOLDER = 'contracts';

export async function GET(
  request: NextRequest,
  { params }: { params: { contractId: string; fileId: string } }
) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    let payload;
    try {
      payload = verifyClientPortalToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const { contractId, fileId } = params;
    const db = await createDatabaseService();
    const partiesFromToken = await db.relevantParty.findByIds(payload.partyIds);

    if (partiesFromToken.length === 0) {
      return NextResponse.json(
        { error: 'No matching relevant parties found for this token' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const sanitizedEmail = payload.email.trim().toLowerCase();
    const authorizedParty = partiesFromToken.find((party) => {
      return (
        party.email.trim().toLowerCase() === sanitizedEmail &&
        party.contractId === contractId
      );
    });

    if (!authorizedParty) {
      return NextResponse.json(
        { error: 'Token does not grant access to this contract' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const file = await db.file.findById(fileId);

    if (!file || file.contractId !== contractId) {
      return NextResponse.json(
        { error: 'File not found or not associated with this contract' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    if (!file.storageKey) {
      return NextResponse.json(
        { error: 'File has no content' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const storage = await createStorageService();
    const downloadUrl = await storage.getFileUrl(
      STORAGE_FOLDER,
      file.storageKey,
      60 * 15
    );

    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error('Failed to download file from client portal', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
