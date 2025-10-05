import { CredentialsSignin } from 'next-auth';

/**
 * Error thrown when provided credentials are invalid.
 */
export class InvalidCredentialsError extends CredentialsSignin {
  code = 'custom';
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}
