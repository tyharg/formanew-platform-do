import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashes a password using bcrypt.
 *
 * @param password - Plain text password.
 * @returns Password hashed.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verify a password by comparing it with a hash.
 *
 * @param plainPassword - Unencrypted password.
 * @param hashedPassword - Previously encrypted password.
 * @returns `true` if they match, `false` otherwise.
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
