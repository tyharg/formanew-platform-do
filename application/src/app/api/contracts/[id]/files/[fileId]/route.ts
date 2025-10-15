import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createStorageService } from 'services/storage/storageFactory';

const STORAGE_FOLDER = 'contracts';

const deleteContractFile = async (
  _request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string; fileId: string }>
): Promise<NextResponse> => {
  try {
    const { id: contractId, fileId } = await paramsPromise;
    const dbClient = await createDatabaseService();

    const contract = await dbClient.contract.findById(contractId);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const parentCompany = await dbClient.company.findById(contract.companyId);
    if (!parentCompany || parentCompany.userId !== user.id) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const fileRecord = await dbClient.file.findById(fileId);
    if (!fileRecord || fileRecord.contractId !== contractId) {
      return NextResponse.json({ error: 'File not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const storageService = await createStorageService();

    if (fileRecord.storageKey) {
      try {
        await storageService.deleteFile(STORAGE_FOLDER, fileRecord.storageKey);
      } catch (storageError) {
        console.error('Failed to delete file from storage:', storageError);
        return NextResponse.json(
          { error: 'Unable to delete the file right now. Please try again later.' },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }
    }

    await dbClient.file.delete(fileId);

    return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to delete contract file:', error);
    return NextResponse.json(
      { error: 'Unable to delete the file right now. Please try again later.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

export const DELETE = withAuth(deleteContractFile);
