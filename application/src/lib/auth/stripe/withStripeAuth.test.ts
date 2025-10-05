/* eslint-disable  @typescript-eslint/no-explicit-any */
import { withStripeAuth } from './withStripeAuth';
import { NextRequest, NextResponse } from 'next/server';

const mockHandler = jest.fn();
const mockConstructEvent = jest.fn();

jest.mock('stripe', () => ({
  webhooks: {
    constructEvent: (...args: any[]) => mockConstructEvent(...args),
  },
}));

let secret: string | undefined = 'whsec_test';
jest.mock('settings', () => ({
  serverConfig: {
    Stripe: {
      get webhookSecret() {
        return secret;
      },
    },
  },
}));

describe('withStripeAuth', () => {
  function mockNextRequest({
    headers = {},
    body = '',
  }: {
    headers?: Record<string, string | null>;
    body?: string;
  }) {
    return {
      headers: {
        get: (key: string) => {
          const val = headers[key.toLowerCase()] ?? headers[key];
          return val === null ? undefined : val;
        },
      },
      text: async () => body,
    } as unknown as NextRequest;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    secret = 'whsec_test';
  });

  it('returns 500 if signature is missing', async () => {
    const req = mockNextRequest({ headers: {} });
    const wrapped = withStripeAuth(mockHandler);
    const res = await wrapped(req);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('returns 500 if webhookSecret is not configured', async () => {
    secret = undefined;
    const req = mockNextRequest({ headers: { 'stripe-signature': 'sig' } });
    const wrapped = withStripeAuth(mockHandler);
    const res = await wrapped(req);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
    secret = 'whsec_test';
  });

  it('returns 500 if Stripe.webhooks.constructEvent throws', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('fail');
    });
    const req = mockNextRequest({ headers: { 'stripe-signature': 'sig' }, body: 'body' });
    const wrapped = withStripeAuth(mockHandler);
    const res = await wrapped(req);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('calls handler with event if all checks pass', async () => {
    const fakeEvent = { type: 'customer.subscription.created' };
    mockConstructEvent.mockReturnValue(fakeEvent);
    mockHandler.mockResolvedValue(NextResponse.json({ ok: true }));
    const req = mockNextRequest({ headers: { 'stripe-signature': 'sig' }, body: 'body' });
    const wrapped = withStripeAuth(mockHandler);
    const res = await wrapped(req);
    expect(mockHandler).toHaveBeenCalledWith(fakeEvent);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
