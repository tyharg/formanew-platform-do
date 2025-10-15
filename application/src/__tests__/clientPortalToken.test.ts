import type { ClientPortalTokenPayload } from 'lib/auth/clientPortalToken';

describe('clientPortalToken helpers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, CLIENT_PORTAL_JWT_SECRET: 'unit-test-secret' };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates and verifies a token payload', async () => {
    const { createClientPortalToken, verifyClientPortalToken } = await import('lib/auth/clientPortalToken');

    const token = createClientPortalToken({
      email: 'party@example.com',
      partyIds: ['party-1', 'party-2'],
    });

    const payload = verifyClientPortalToken(token) as ClientPortalTokenPayload;

    expect(payload.email).toBe('party@example.com');
    expect(payload.partyIds).toEqual(['party-1', 'party-2']);
    expect(typeof payload.exp).toBe('number');
  });

  it('throws when secret is missing', async () => {
    process.env = { ...originalEnv, CLIENT_PORTAL_JWT_SECRET: '', AUTH_SECRET: '' };
    jest.resetModules();

    const { createClientPortalToken } = await import('lib/auth/clientPortalToken');

    expect(() =>
      createClientPortalToken({ email: 'party@example.com', partyIds: ['party-1'] })
    ).toThrow('Client portal JWT secret is not configured');
  });
});
