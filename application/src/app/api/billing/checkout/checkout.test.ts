import { HTTP_STATUS } from 'lib/api/http';
import { checkout } from './checkout';
import { NextRequest } from 'next/server';

const mockFindByUserId = jest.fn();
const mockManageSubscription = jest.fn();

jest.mock('services/database/databaseFactory', () => ({
  createDatabaseService: () => ({
    subscription: {
      findByUserId: mockFindByUserId,
    },
  }),
}));

jest.mock('services/billing/billingFactory', () => ({
  createBillingService: () =>
    Promise.resolve({
      manageSubscription: mockManageSubscription,
    }),
}));

describe('checkout', () => {
  const user = { id: 'u1', role: 'user', email: 'test@example.com' };
  function mockNextRequest(body: unknown = {}) {
    return { json: jest.fn().mockResolvedValue(body) } as unknown as NextRequest;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 if no subscription', async () => {
    mockFindByUserId.mockResolvedValue(undefined);
    const res = await checkout(mockNextRequest(), user);
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await res.json()).toEqual({ error: 'No subscription found' });
  });

  it('returns 500 if billingService.manageSubscription fails', async () => {
    mockFindByUserId.mockResolvedValue([{ customerId: 'cust1' }]);
    mockManageSubscription.mockResolvedValue(undefined);
    const res = await checkout(mockNextRequest(), user);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 200 and url on success', async () => {
    mockFindByUserId.mockResolvedValue([{ customerId: 'cust1' }]);
    mockManageSubscription.mockResolvedValue('http://portal-url');
    const res = await checkout(mockNextRequest(), user);
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ url: 'http://portal-url' });
  });
});
