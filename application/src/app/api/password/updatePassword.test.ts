jest.mock('services/database/database');

import { updatePassword } from './updatePassword';
import { NextRequest } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';

jest.mock('services/email/emailFactory');
jest.mock('services/email/emailTemplate', () => ({ emailTemplate: jest.fn(() => 'html') }));

const mockEmailClient = {
  sendReactEmail: jest.fn(),
  isEmailEnabled: jest.fn(),
};

const mockFindById = jest.fn();
const mockUpdate = jest.fn();
const mockDb = {
  user: {
    findById: mockFindById,
    update: mockUpdate,
    findByEmail: jest.fn(),
    findByEmailAndPassword: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  subscription: {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  note: {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('../../../services/database/databaseFactory', () => ({
  createDatabaseService: () => Promise.resolve(mockDb),
}));

jest.mock('../../../services/email/emailFactory', () => ({
  createEmailService: () => Promise.resolve(mockEmailClient),
}));

const mockUser = { id: 'user1', role: 'user' };

function createRequestWithFormData(fields: Record<string, string>) {
  return {
    formData: async () => new Map(Object.entries(fields)),
  } as unknown as NextRequest;
}

describe('updatePassword', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockEmailClient.isEmailEnabled.mockReturnValue(true);
  });

  it('returns error if current password is empty', async () => {
    const req = createRequestWithFormData({
      currentPassword: '',
      newPassword: 'a',
      confirmNewPassword: 'a',
    });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.error).toMatch(/current password cannot be empty/i);
  });

  it('returns error if new password is empty', async () => {
    const req = createRequestWithFormData({
      currentPassword: 'a',
      newPassword: '',
      confirmNewPassword: 'a',
    });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.error).toMatch(/new password cannot be empty/i);
  });

  it('returns error if confirm new password is empty', async () => {
    const req = createRequestWithFormData({
      currentPassword: 'a',
      newPassword: 'a',
      confirmNewPassword: '',
    });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.error).toMatch(/confirm new password cannot be empty/i);
  });

  it('returns error if new passwords do not match', async () => {
    const req = createRequestWithFormData({
      currentPassword: 'a',
      newPassword: 'b',
      confirmNewPassword: 'c',
    });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(json.error).toMatch(/new passwords do not match/i);
  });

  it('returns error if user does not exist', async () => {
    mockFindById.mockResolvedValue(null);
    const req = createRequestWithFormData({
      currentPassword: 'a',
      newPassword: 'b',
      confirmNewPassword: 'b',
    });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(json.error).toMatch(/doesn't exist/i);
  });

  it('returns error if current password is incorrect', async () => {
    mockFindById.mockResolvedValue({ passwordHash: 'hash' });
    const req = createRequestWithFormData({
      currentPassword: 'wrong',
      newPassword: 'b',
      confirmNewPassword: 'b',
    });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(json.error).toMatch(/current password is incorrect/i);
  });

  it('updates password and returns success', async () => {
    mockFindById.mockResolvedValue({
      id: 'user1',
      name: 'Test',
      image: 'img',
      passwordHash: '$2b$12$iyGm98HPjDxoD74cIbEHz.QVTvoPu5kPhiIuB6chsL6agm1x.KgF.',
    });
    mockUpdate.mockResolvedValue(undefined);
    const req = createRequestWithFormData({
      currentPassword: '1234',
      newPassword: 'new',
      confirmNewPassword: 'new',
    });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(json.name).toBe('Test');
    expect(json.image).toBe('img');
  });

  it('returns 500 on unexpected error', async () => {
    mockDb.user.findById.mockRejectedValue(new Error('db error'));
    const req = createRequestWithFormData({
      currentPassword: 'a',
      newPassword: 'b',
      confirmNewPassword: 'b',
    });
    const res = await updatePassword(req, mockUser);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(json.error).toMatch(/internal server error/i);
  });

  it("don't send email if feature flag is disabled", async () => {
    mockFindById.mockResolvedValue({
      id: 'user1',
      name: 'Test',
      image: 'img',
      passwordHash: '$2b$12$iyGm98HPjDxoD74cIbEHz.QVTvoPu5kPhiIuB6chsL6agm1x.KgF.',
    });
    mockUpdate.mockResolvedValue(undefined);
    const req = createRequestWithFormData({
      currentPassword: '1234',
      newPassword: 'new',
      confirmNewPassword: 'new',
    });
    mockEmailClient.isEmailEnabled.mockReturnValue(false);
    const res = await updatePassword(req, mockUser);

    expect(mockEmailClient.sendReactEmail).not.toHaveBeenCalled();
    expect(res.status).toBe(HTTP_STATUS.OK);
  });
});
