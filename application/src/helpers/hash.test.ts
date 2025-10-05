import { hashPassword, verifyPassword } from './hash';

describe('Password utilities', () => {
  it('hashes a password correctly', async () => {
    const plain = 'mySecret123!';
    const hash = await hashPassword(plain);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(plain);
    expect(hash).toMatch(/^\$2[aby]\$.{56}$/);
  });

  it('verifies the correct password', async () => {
    const plain = 'testPassword!';
    const hash = await hashPassword(plain);
    const result = await verifyPassword(plain, hash);

    expect(result).toBe(true);
  });

  it('fails verification for incorrect password', async () => {
    const hash = await hashPassword('realPassword123');
    const result = await verifyPassword('wrongPassword456', hash);

    expect(result).toBe(false);
  });
});
