import { HTTP_STATUS } from 'lib/api/http';
import { USER_ROLES } from 'lib/auth/roles';
import { editUser } from './editUser';
import { NextRequest } from 'next/server';
import { SubscriptionPlanEnum } from 'types';

const mockDbClient = {
  user: { update: jest.fn() },
  subscription: { update: jest.fn(), findByUserId: jest.fn() },
};
const mockBilling = {
  listSubscription: jest.fn(),
  updateSubscription: jest.fn(),
};

jest.mock('services/billing/billingFactory', () => ({
  createBillingService: () => Promise.resolve(mockBilling),
}));

jest.mock('../../../../services/database/databaseFactory', () => ({
  createDatabaseService: () => Promise.resolve(mockDbClient),
}));

describe('updateUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  function makeRequest(body: Record<string, unknown>) {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  }

  const mockAuthData = {
    id: 'id',
    role: USER_ROLES.ADMIN,
  };

  it('returns 400 if no id is provided', async () => {
    const req = makeRequest({ name: 'Test' });
    const res = await editUser(req, mockAuthData, Promise.resolve({ id: undefined }));
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await res.json()).toEqual({ error: 'User ID is required' });
  });

  it('returns 400 if no valid fields to update', async () => {
    const req = makeRequest({ notAllowed: 'foo' });
    const res = await editUser(req, mockAuthData, Promise.resolve({ id: '1' }));
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await res.json()).toEqual({ error: 'No valid fields to update' });
  });

  it('updates allowed fields and returns updated user', async () => {
    const updatedUser = { id: '1', name: 'New', role: USER_ROLES.ADMIN };
    mockDbClient.user.update.mockResolvedValue(updatedUser);
    const req = makeRequest({ name: 'New', role: USER_ROLES.ADMIN });
    const res = await editUser(req, mockAuthData, Promise.resolve({ id: '1' }));
    expect(mockDbClient.user.update).toHaveBeenCalledWith('1', {
      name: 'New',
      role: USER_ROLES.ADMIN,
    });
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ user: updatedUser });
  });

  it('updates subscription to PRO (gift) if provided', async () => {
    mockDbClient.user.update.mockResolvedValue({ id: '1' });
    mockDbClient.subscription.findByUserId.mockResolvedValue([{ customerId: 'cus_1' }]);
    mockBilling.listSubscription.mockResolvedValue([{ id: 'sub_1', items: [{ id: 'item_1' }] }]);
    mockBilling.updateSubscription.mockResolvedValue({});
    const req = makeRequest({ subscription: { plan: SubscriptionPlanEnum.PRO } });
    const res = await editUser(req, mockAuthData, Promise.resolve({ id: '1' }));
    expect(mockDbClient.subscription.findByUserId).toHaveBeenCalledWith('1');
    expect(mockBilling.listSubscription).toHaveBeenCalledWith('cus_1');
    expect(mockBilling.updateSubscription).toHaveBeenCalledWith('sub_1', 'item_1', 'GIFT');
    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it('updates subscription to FREE if provided', async () => {
    mockDbClient.user.update.mockResolvedValue({ id: '1' });
    mockDbClient.subscription.findByUserId.mockResolvedValue([{ customerId: 'cus_1' }]);
    mockBilling.listSubscription.mockResolvedValue([{ id: 'sub_1', items: [{ id: 'item_1' }] }]);
    mockBilling.updateSubscription.mockResolvedValue({});
    const req = makeRequest({ subscription: { plan: SubscriptionPlanEnum.FREE } });
    const res = await editUser(req, mockAuthData, Promise.resolve({ id: '1' }));
    expect(mockDbClient.subscription.findByUserId).toHaveBeenCalledWith('1');
    expect(mockBilling.listSubscription).toHaveBeenCalledWith('cus_1');
    expect(mockBilling.updateSubscription).toHaveBeenCalledWith(
      'sub_1',
      'item_1',
      SubscriptionPlanEnum.FREE
    );
    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it('returns 500 if no existing subscription for PRO/FREE update', async () => {
    mockDbClient.user.update.mockResolvedValue({ id: 1 });
    mockDbClient.subscription.findByUserId.mockResolvedValue([]);
    const req = makeRequest({ subscription: { plan: SubscriptionPlanEnum.PRO } });
    const res = await editUser(req, mockAuthData, Promise.resolve({ id: '1' }));
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'No existing subscription found for user' });
  });

  it('returns 500 on server error', async () => {
    mockDbClient.user.update.mockRejectedValue(new Error('fail'));
    const req = makeRequest({ name: 'X' });
    const res = await editUser(req, mockAuthData, Promise.resolve({ id: '1' }));
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
  });
});
