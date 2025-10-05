/* eslint-disable  @typescript-eslint/no-explicit-any */
import { HTTP_STATUS } from 'lib/api/http';
import { webhookHandler } from './webhookHandler';

const mockHandleSubscriptionCreated = jest.fn();
const mockHandleSubscriptionUpdated = jest.fn();
const mockHandleSubscriptionDeleted = jest.fn();

jest.mock('./handleSubscriptionCreated', () => ({
  handleSubscriptionCreated: (args: any) => mockHandleSubscriptionCreated(args),
}));
jest.mock('./handleSubscriptionUpdated', () => ({
  handleSubscriptionUpdated: (args: any) => mockHandleSubscriptionUpdated(args),
}));
jest.mock('./handleSubscriptionDeleted', () => ({
  handleSubscriptionDeleted: (args: any) => mockHandleSubscriptionDeleted(args),
}));

describe('webhookHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls handleSubscriptionCreated for customer.subscription.created', async () => {
    const event = { type: 'customer.subscription.created', data: { object: {} } };
    await webhookHandler(event);
    expect(mockHandleSubscriptionCreated).toHaveBeenCalledWith(event);
  });

  it('calls handleSubscriptionUpdated for customer.subscription.updated', async () => {
    const event = { type: 'customer.subscription.updated', data: { object: {} } };
    await webhookHandler(event);
    expect(mockHandleSubscriptionUpdated).toHaveBeenCalledWith(event);
  });

  it('calls handleSubscriptionDeleted for customer.subscription.deleted', async () => {
    const event = { type: 'customer.subscription.deleted', data: { object: {} } };
    await webhookHandler(event);
    expect(mockHandleSubscriptionDeleted).toHaveBeenCalledWith(event);
  });

  it('does nothing for unhandled event type', async () => {
    const event = { type: 'unhandled.event', data: { object: {} } };
    await webhookHandler(event);
    expect(mockHandleSubscriptionCreated).not.toHaveBeenCalled();
    expect(mockHandleSubscriptionUpdated).not.toHaveBeenCalled();
    expect(mockHandleSubscriptionDeleted).not.toHaveBeenCalled();
  });

  it('returns 500 if handler throws', async () => {
    const event = { type: 'customer.subscription.created', data: { object: {} } };
    mockHandleSubscriptionCreated.mockRejectedValueOnce(new Error('fail'));
    const res = await webhookHandler(event);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
