import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * API route handler for resetting a user's password using a token.
 *
 * Expects a POST request with a JSON body containing:
 *   - token: The password reset token
 *   - password: The new password
 *
 * Validates the token, updates the user's password, deletes the token, and returns a JSON response.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    const db = await createDatabaseService();

    // Find token
    const verificationToken = await db.verificationToken.findByToken(token);
    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Update user password
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.updateByEmail(verificationToken.identifier, { passwordHash: hashedPassword });

    // Delete token
    await db.verificationToken.delete(verificationToken.identifier, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
