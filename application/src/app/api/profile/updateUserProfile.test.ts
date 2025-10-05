// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

// Mock storage service
const mockUploadFile = jest.fn();
const mockGetFileUrl = jest.fn();
const mockDeleteFile = jest.fn();
jest.mock('../../../services/storage/storageFactory', () => ({
  createStorageService: () =>
    Promise.resolve({
      uploadFile: mockUploadFile,
      getFileUrl: mockGetFileUrl,
      deleteFile: mockDeleteFile,
    }),
}));

// Mock auth
const mockAuth = jest.fn();
jest.mock('../../../lib/auth/auth', () => ({
  auth: async () => mockAuth(),
}));

// Mock url helper
const mockGetFileNameFromUrl = jest.fn();
jest.mock('../../../helpers/fileName', () => ({
  getFileNameFromUrl: () => mockGetFileNameFromUrl(),
}));

// Mock database client
const mockFindById = jest.fn();
const mockUpdate = jest.fn();
jest.mock('../../../services/database/databaseFactory', () => ({
  createDatabaseService: () =>
    Promise.resolve({
      user: {
        findById: mockFindById,
        update: mockUpdate,
      },
    }),
}));

// Import the handler after mocks
import { NextRequest } from 'next/server';
import { updateUserProfile } from './updateUserProfile';
import { USER_ROLES } from 'lib/auth/roles';
import { HTTP_STATUS } from 'lib/api/http';

describe('upload picture should', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: authenticated user with id 'user-123'
  });
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } });
    mockFindById.mockResolvedValue({ id: 'user-id', image: 'image-url', name: 'mockName' });
    mockDeleteFile.mockResolvedValue({});
    mockGetFileNameFromUrl.mockReturnValue('url');
  });

  function createFile(name: string, type: string, size: number) {
    const file = new File(['a'.repeat(size)], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  }

  function createFormDataWithFile(file: File | null, name: string | null) {
    return {
      get: (key: string) => (key === 'file' ? file : name),
    };
  }

  function createRequestWithFileAndName(file: File | null, name: string | null) {
    return {
      formData: async () => createFormDataWithFile(file, name),
    } as NextRequest;
  }

  it('return error if file type is not jpg or png', async () => {
    // auth is mocked as authenticated
    const file = createFile('test.txt', 'text/plain', 100);
    const req = createRequestWithFileAndName(file, null);
    const res = await updateUserProfile(req, { id: 'user-123', role: USER_ROLES.USER });
    const json = await res.json();
    expect(json).toEqual({ error: 'Only JPG or PNG files are allowed' });
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it('return error if file size is greater than 5MB', async () => {
    // auth is mocked as authenticated
    const file = createFile('test.jpg', 'image/jpeg', 6 * 1024 * 1024);
    const req = createRequestWithFileAndName(file, null);
    const res = await updateUserProfile(req, { id: 'user-123', role: USER_ROLES.USER });
    const json = await res.json();
    expect(json).toEqual({ error: 'File size must be 5MB or less' });
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
  it('return error if upload fails', async () => {
    // auth is mocked as authenticated
    mockUploadFile.mockRejectedValueOnce(new Error('Upload failed'));
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFileAndName(file, null);
    const res = await updateUserProfile(req, { id: 'user-123', role: USER_ROLES.USER });
    const json = await res.json();
    expect(json).toEqual({
      error:
        'Profile update error. Check your DigitalOcean Spaces and DB settings on the system status page. [Error: Upload failed]',
    });
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });

  it('return success response on successful file upload', async () => {
    // auth is mocked as authenticated
    mockUploadFile.mockResolvedValueOnce('mock-uuid.jpg');
    mockGetFileUrl.mockResolvedValueOnce('https://example.com/file-url');
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFileAndName(file, null);
    const res = await updateUserProfile(req, { id: 'user-123', role: USER_ROLES.USER });
    const json = await res.json();
    expect(json).toEqual({ name: 'mockName', image: 'https://example.com/file-url' });
    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it('return error if user not found in db', async () => {
    // auth is mocked as authenticated
    mockFindById.mockResolvedValueOnce(null);
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFileAndName(file, null);
    mockUploadFile.mockResolvedValueOnce('mock-uuid.jpg');
    mockGetFileUrl.mockResolvedValueOnce('https://example.com/file-url');
    const res = await updateUserProfile(req, { id: 'user-123', role: USER_ROLES.USER });
    const json = await res.json();
    expect(json).toEqual({ error: "User doesn't exist" });
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
  });
  it('return error if db update fails', async () => {
    // auth is mocked as authenticated
    mockUploadFile.mockResolvedValueOnce('mock-uuid.jpg');
    mockGetFileUrl.mockResolvedValueOnce('https://example.com/file-url');
    mockUpdate.mockRejectedValueOnce(new Error('DB update failed'));
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFileAndName(file, null);
    const res = await updateUserProfile(req, { id: 'user-123', role: USER_ROLES.USER });
    const json = await res.json();
    expect(json).toEqual({
      error:
        'Profile update error. Check your DigitalOcean Spaces and DB settings on the system status page. [Error: DB update failed]',
    });
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
  it('return error if db delete fails', async () => {
    // auth is mocked as authenticated
    mockDeleteFile.mockRejectedValueOnce(new Error('DB update failed'));
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFileAndName(file, null);
    const res = await updateUserProfile(req, { id: 'user-123', role: USER_ROLES.USER });
    const json = await res.json();
    expect(json).toEqual({
      error:
        'Profile update error. Check your DigitalOcean Spaces and DB settings on the system status page. [Error: DB update failed]',
    });
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });

  it('update name if receive name param and file', async () => {
    // auth is mocked as authenticated
    mockGetFileUrl.mockResolvedValueOnce('https://example.com/file-url');
    const file = createFile('test.jpg', 'image/jpeg', 100);
    const req = createRequestWithFileAndName(file, 'testNewName');
    const res = await updateUserProfile(req, { id: 'user-123', role: USER_ROLES.USER });
    const json = await res.json();
    expect(json).toEqual({ name: 'testNewName', image: 'https://example.com/file-url' });
    expect(mockUpdate).toHaveBeenCalledWith('user-id', {
      id: 'user-id',
      image: 'https://example.com/file-url',
      name: 'testNewName',
    });
    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it('update name if only receive name param', async () => {
    // auth is mocked as authenticated
    const req = createRequestWithFileAndName(null, 'testNewName');
    const res = await updateUserProfile(req, { id: 'user-123', role: USER_ROLES.USER });
    const json = await res.json();
    expect(json).toEqual({ name: 'testNewName', image: 'image-url' });
    expect(mockUpdate).toHaveBeenCalledWith('user-id', {
      id: 'user-id',
      image: 'image-url',
      name: 'testNewName',
    });
    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it('fails name param is empty string', async () => {
    // auth is mocked as authenticated
    const req = createRequestWithFileAndName(null, '');
    const res = await updateUserProfile(req, { id: 'user-123', role: USER_ROLES.USER });
    const json = await res.json();
    expect(json).toEqual({ error: 'Name invalid' });
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});
