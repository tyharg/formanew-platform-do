import { GET } from './route';
import { NextRequest } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';

jest.mock('services/database/databaseFactory', () => ({
  createDatabaseService: jest.fn(),
}));
jest.mock('services/billing/billingFactory', () => ({
  createBillingService: jest.fn(),
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
};

const mockDb = {
  user: {
    findByVerificationToken: jest.fn(),
    update: jest.fn(),
  },
  subscription: {
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockBillingService = {
  createCustomer: jest.fn(),
  createSubscription: jest.fn(),
  checkConfiguration: jest.fn(),
};

import * as billingModule from 'services/billing/billingFactory';

(billingModule.createBillingService as jest.Mock).mockResolvedValue(mockBillingService);

jest.mock('services/database/databaseFactory', () => ({
  createDatabaseService: () => Promise.resolve(mockDb),
}));

const createRequest = (token?: string) => {
  const url = new URL('http://localhost/api/verify-email');
  if (token) url.searchParams.set('token', token);
  return { nextUrl: url } as unknown as NextRequest;
};

describe('GET /api/verify-email', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if token is missing', async () => {
    const req = createRequest();
    const res = await GET(req);
    expect(await res.json()).toEqual({ error: 'Missing token' });
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it('returns 400 if user not found', async () => {
    mockDb.user.findByVerificationToken.mockResolvedValue(null);
    const req = createRequest('token123');
    const res = await GET(req);
    expect(await res.json()).toEqual({ error: 'Invalid or expired token' });
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it('returns 500 if subscription creation fails', async () => {
    mockDb.user.findByVerificationToken.mockResolvedValue(mockUser);
    mockDb.user.update.mockResolvedValue({});
    mockDb.subscription.findByUserId.mockResolvedValue([]);
    mockBillingService.createCustomer.mockResolvedValue({ id: 'cust-1' });
    mockDb.subscription.create.mockResolvedValue({});
    mockBillingService.createSubscription.mockRejectedValue(new Error('fail'));
    mockBillingService.checkConfiguration.mockResolvedValue({ configured: true, connected: true });
    const req = createRequest('token123');
    const res = await GET(req);
    expect(await res.json()).toEqual({ error: 'Error creating subscription' });
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });

  it('returns 200 and success if all ok (new customer)', async () => {
    mockDb.user.findByVerificationToken.mockResolvedValue(mockUser);
    mockDb.user.update.mockResolvedValue({});
    mockDb.subscription.findByUserId.mockResolvedValue([]);
    mockBillingService.createCustomer.mockResolvedValue({ id: 'cust-1' });
    mockBillingService.checkConfiguration.mockResolvedValue({ configured: true, connected: true });
    mockDb.subscription.create.mockResolvedValue({});
    mockBillingService.createSubscription.mockResolvedValue({});
    mockDb.subscription.update.mockResolvedValue({});
    const req = createRequest('token123');
    const res = await GET(req);
    expect(await res.json()).toEqual({ success: true });
    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it('returns 200 and success if all ok (existing customer)', async () => {
    mockDb.user.findByVerificationToken.mockResolvedValue(mockUser);
    mockDb.user.update.mockResolvedValue({});
    mockDb.subscription.findByUserId.mockResolvedValue([{ customerId: 'cust-1' }]);
    mockBillingService.createSubscription.mockResolvedValue({});
    mockBillingService.checkConfiguration.mockResolvedValue({ configured: true, connected: true });
    mockDb.subscription.update.mockResolvedValue({});
    const req = createRequest('token123');
    const res = await GET(req);
    expect(await res.json()).toEqual({ success: true });
    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it('returns 200 if billing is not configured', async () => {
    mockDb.user.findByVerificationToken.mockResolvedValue(mockUser);
    mockDb.user.update.mockResolvedValue({});
    mockBillingService.checkConfiguration.mockResolvedValue({
      configured: false,
      connected: false,
    });
    const req = createRequest('token123');
    const res = await GET(req);
    expect(mockBillingService.createCustomer).not.toHaveBeenCalled();
    expect(mockBillingService.createSubscription).not.toHaveBeenCalled();
    expect(mockDb.subscription.findByUserId).not.toHaveBeenCalled();
    expect(mockDb.subscription.update).not.toHaveBeenCalled();
    expect(await res.json()).toEqual({ success: true });
    expect(res.status).toBe(HTTP_STATUS.OK);
  });
});
