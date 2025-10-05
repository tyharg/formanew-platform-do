import { HTTP_STATUS } from 'lib/api/http';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createEmailService } from 'services/email/emailFactory';

jest.mock('services/database/databaseFactory');
jest.mock('services/email/emailFactory');

const mockDb = {
  user: { findByEmail: jest.fn() },
  verificationToken: { create: jest.fn() },
};
const mockEmailService = {
  sendReactEmail: jest.fn(),
  checkConfiguration: jest.fn(),
  isEmailEnabled: jest.fn(),
};

beforeEach(() => {
  jest.resetAllMocks();
  (createDatabaseService as jest.Mock).mockResolvedValue(mockDb);
  (createEmailService as jest.Mock).mockResolvedValue(mockEmailService);
  mockEmailService.isEmailEnabled.mockReturnValue(true);
  mockEmailService.checkConfiguration.mockResolvedValue({ configured: true, connected: true });
});

describe('POST /api/forgot-password', () => {
  it('returns 400 if email is missing', async () => {
    const req = { json: async () => ({}) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const data = await res.json();
    expect(data.error).toBe('Email is required');
  });

  it('returns success if user does not exist', async () => {
    mockDb.user.findByEmail.mockResolvedValue(null);
    const req = { json: async () => ({ email: 'test@example.com' }) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.OK);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('creates token and sends email if user exists', async () => {
    mockDb.user.findByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });
    const req = { json: async () => ({ email: 'test@example.com' }) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(mockDb.verificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'test@example.com',
        token: expect.any(String),
        expires: expect.any(Date),
      })
    );
    expect(mockEmailService.sendReactEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Reset your password',
      expect.any(Object)
    );
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('returns 500 and logs error on exception', async () => {
    mockDb.user.findByEmail.mockRejectedValue(new Error('DB error'));
    const req = { json: async () => ({ email: 'test@example.com' }) } as unknown as NextRequest;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(consoleSpy).toHaveBeenCalled();
    const data = await res.json();
    expect(data.error).toBe('DB error');
    consoleSpy.mockRestore();
  });

  it('returns 500 if email is missing', async () => {
    mockEmailService.isEmailEnabled.mockReturnValue(false);
    const req = { json: async () => ({}) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const data = await res.json();
    expect(data.error).toBe('Email feature is disabled');
  });

  it('returns 500 if email is not configured', async () => {
    mockEmailService.checkConfiguration.mockResolvedValue({ configured: false, connected: false });
    const req = { json: async () => ({}) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const data = await res.json();
    expect(data.error).toBe('Email not configured or connected. Check System Status page');
  });
});
