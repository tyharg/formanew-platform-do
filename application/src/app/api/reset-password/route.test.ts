import { POST } from './route';
import { NextRequest } from 'next/server';

jest.mock('services/database/databaseFactory');
import { createDatabaseService } from 'services/database/databaseFactory';
import bcrypt from 'bcryptjs';
jest.mock('bcryptjs');

const mockDb = {
  verificationToken: {
    findByToken: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    updateByEmail: jest.fn(),
  },
};

beforeEach(() => {
  jest.resetAllMocks();
  (createDatabaseService as jest.Mock).mockResolvedValue(mockDb);
  (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
});

describe('POST /api/reset-password', () => {
  it('returns 400 if token or password is missing', async () => {
    const req = { json: async () => ({}) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Token and password are required');
  });

  it('returns 400 if token is invalid or expired', async () => {
    mockDb.verificationToken.findByToken.mockResolvedValue(null);
    const req = {
      json: async () => ({ token: 'abc', password: 'pass' }),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid or expired token');
  });

  it('returns 400 if token is expired', async () => {
    mockDb.verificationToken.findByToken.mockResolvedValue({
      identifier: 'test@example.com',
      token: 'abc',
      expires: new Date(Date.now() - 1000),
    });
    const req = {
      json: async () => ({ token: 'abc', password: 'pass' }),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid or expired token');
  });

  it('updates password and deletes token if valid', async () => {
    mockDb.verificationToken.findByToken.mockResolvedValue({
      identifier: 'test@example.com',
      token: 'abc',
      expires: new Date(Date.now() + 100000),
    });
    const req = {
      json: async () => ({ token: 'abc', password: 'pass' }),
    } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
    expect(mockDb.user.updateByEmail).toHaveBeenCalledWith('test@example.com', {
      passwordHash: 'hashed',
    });
    expect(mockDb.verificationToken.delete).toHaveBeenCalledWith('test@example.com', 'abc');
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('returns 500 and logs error on exception', async () => {
    mockDb.verificationToken.findByToken.mockRejectedValue(new Error('DB error'));
    const req = {
      json: async () => ({ token: 'abc', password: 'pass' }),
    } as unknown as NextRequest;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const res = await POST(req);
    expect(res.status).toBe(500);
    expect(consoleSpy).toHaveBeenCalled();
    const data = await res.json();
    expect(data.error).toBe('An unexpected error occurred.');
    consoleSpy.mockRestore();
  });
});
