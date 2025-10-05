import { HTTP_STATUS } from 'lib/api/http';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createEmailService } from 'services/email/emailFactory';

jest.mock('services/database/databaseFactory');
jest.mock('services/email/emailFactory');
jest.mock('services/email/emailTemplate', () => ({ emailTemplate: jest.fn(() => 'html') }));

const mockDb = {
  user: {
    findByEmail: jest.fn(),
  },
  verificationToken: {
    create: jest.fn(),
  },
};
const mockEmailClient = {
  sendReactEmail: jest.fn(),
  checkConfiguration: jest.fn(),
  isEmailEnabled: jest.fn(),
};

(createDatabaseService as jest.Mock).mockReturnValue(mockDb);
(createEmailService as jest.Mock).mockReturnValue(mockEmailClient);

describe('POST /api/auth/magic-link', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailClient.isEmailEnabled.mockReturnValue(true);
    mockEmailClient.checkConfiguration.mockResolvedValue({ configured: true, connected: true });
  });

  function makeRequest(email?: string) {
    return {
      json: async () => (email ? { email } : {}),
    } as unknown as NextRequest;
  }

  it('returns 400 if email is missing', async () => {
    const req = makeRequest();
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const json = await res.json();
    expect(json.error).toMatch(/email is required/i);
  });

  it('returns 404 if user is not found', async () => {
    mockDb.user.findByEmail.mockResolvedValue(null);
    const req = makeRequest('notfound@example.com');
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    const json = await res.json();
    expect(json.error).toMatch(/user not found/i);
  });

  it('returns 200 and sends email if user exists', async () => {
    mockDb.user.findByEmail.mockResolvedValue({ email: 'test@example.com' });
    mockDb.verificationToken.create.mockResolvedValue(undefined);
    mockEmailClient.sendReactEmail = jest.fn().mockResolvedValue(undefined);
    const req = makeRequest('test@example.com');
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.OK);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockDb.user.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockDb.verificationToken.create).toHaveBeenCalled();
    expect(mockEmailClient.sendReactEmail).toHaveBeenCalledWith(
      'test@example.com',
      'Login to your account',
      expect.any(Object)
    );
  });

  it('returns 500 if an error is thrown', async () => {
    mockDb.user.findByEmail.mockRejectedValue(new Error('db error'));
    const req = makeRequest('fail@example.com');
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const json = await res.json();
    expect(json.error).toMatch(/db error/i);
  });

  it('returns 500 if email is missing', async () => {
    mockEmailClient.isEmailEnabled.mockReturnValue(false);
    const req = { json: async () => ({}) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const data = await res.json();
    expect(data.error).toBe('Email feature is disabled');
  });

  it('returns 500 if email is not configured', async () => {
    mockEmailClient.checkConfiguration.mockResolvedValue({ configured: false, connected: false });
    const req = { json: async () => ({}) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const data = await res.json();
    expect(data.error).toBe('Email not configured or connected. Check System Status page');
  });
});
