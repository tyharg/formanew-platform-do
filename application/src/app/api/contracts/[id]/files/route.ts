import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createStorageService } from 'services/storage/storageFactory';
import { StorageService } from 'services/storage/storage';
import { v4 as uuidv4 } from 'uuid';
import { StoredFile } from 'types';

const STORAGE_FOLDER = 'contracts';

type FileWithDates = Omit<StoredFile, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

type SerializableFile = FileWithDates & { downloadUrl: string | null };

const mapFileWithUrl = async (
  file: FileWithDates,
  storageService: StorageService | null,
  options?: { includeUrl?: boolean }
): Promise<SerializableFile> => {
  if (!options?.includeUrl || !file.storageKey || !storageService) {
    return { ...file, downloadUrl: null };
  }

  try {
    const signedUrl = await storageService.getFileUrl(
      STORAGE_FOLDER,
      file.storageKey,
      60 * 15
    );
    return { ...file, downloadUrl: signedUrl };
  } catch (error) {
    console.error('Failed to generate document download url', error);
    return { ...file, downloadUrl: null };
  }
};

const serializeFile = (file: StoredFile): FileWithDates => ({
  ...file,
  createdAt: file.createdAt instanceof Date ? file.createdAt.toISOString() : file.createdAt,
  updatedAt: file.updatedAt instanceof Date ? file.updatedAt.toISOString() : file.updatedAt,
});

const getContractFiles = async (
  _request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string }>
): Promise<NextResponse> => {
  try {
    const { id: contractId } = await paramsPromise;
    const dbClient = await createDatabaseService();
    const contract = await dbClient.contract.findById(contractId);

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const parentCompany = await dbClient.company.findById(contract.companyId);
    if (!parentCompany || parentCompany.userId !== user.id) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const files = await dbClient.file.findByContractId(contractId);

    let storageService: StorageService | null = null;
    try {
      storageService = await createStorageService();
    } catch (storageError) {
      console.error('Failed to initialize storage service for document listing', storageError);
      storageService = null;
    }

    const mappedFiles = await Promise.all(
      files.map((file) => mapFileWithUrl(serializeFile(file), storageService, { includeUrl: true }))
    );

    return NextResponse.json({ files: mappedFiles }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to list contract files:', error);
    return NextResponse.json(
      { error: 'Unable to load files for this contract.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

const createContractFile = async (
  request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string }>
): Promise<NextResponse> => {
  try {
    const { id: contractId } = await paramsPromise;
    const dbClient = await createDatabaseService();

    const contract = await dbClient.contract.findById(contractId);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const parentCompany = await dbClient.company.findById(contract.companyId);
    if (!parentCompany || parentCompany.userId !== user.id) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Upload a document file before submitting.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const originalName = file.name || 'document';
    const extension = originalName.includes('.')
      ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase()
      : '';

    const maxSizeBytes = 20 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: 'File must be 20MB or smaller.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const storageService = await createStorageService();
    const uniqueId = uuidv4();
    const storageKey = `${contractId}/${uniqueId}${extension ? `.${extension}` : ''}`;

    await storageService.uploadFile(STORAGE_FOLDER, storageKey, file, { ACL: 'private' });

    const name = (formData.get('name') as string | null) || originalName;
    const description = (formData.get('description') as string | null) || null;

    const storedFile = await dbClient.file.create({
      ownerType: 'contract',
      ownerId: contractId,
      name,
      description,
      contentType: file.type || null,
      size: file.size,
      storageKey,
      contractId,
    });

    const serializedFile = serializeFile(storedFile);
    const fileWithUrl = await mapFileWithUrl(serializedFile, storageService, {
      includeUrl: true,
    });

    return NextResponse.json({ file: fileWithUrl }, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    console.error('Failed to upload file:', error);
    const errorMessage =
      error instanceof Error && error.message.includes('Storage client not initialized')
        ? 'Storage service is not configured. Add DigitalOcean Spaces credentials before uploading files.'
        : 'Unable to upload the file right now. Please try again later.';

    return NextResponse.json(
      { error: errorMessage },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};

export const GET = withAuth(getContractFiles);
export const POST = withAuth(createContractFile);
