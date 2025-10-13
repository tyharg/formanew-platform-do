import { serverConfig } from 'settings';

interface TurnstileVerifyResponse {
  success: boolean;
  ['error-codes']?: string[];
}

/**
 * Determine whether Turnstile verification is enabled.
 * Requires both secret and site key env vars to be present.
 */
export const isTurnstileEnabled = () => serverConfig.Turnstile.enabled;

/**
 * Validate a Turnstile token with Cloudflare.
 * Throws on failure so callers can surface an authentication error.
 */
export const verifyTurnstileToken = async (token?: string) => {
  if (!isTurnstileEnabled()) {
    return true;
  }

  if (!token) {
    throw new Error('Missing Turnstile response token');
  }

  const params = new URLSearchParams({
    secret: serverConfig.Turnstile.secretKey as string,
    response: token,
  });

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Unable to validate Turnstile challenge');
  }

  const payload = (await response.json()) as TurnstileVerifyResponse;

  if (!payload.success) {
    const errors = payload['error-codes']?.join(', ');
    throw new Error(errors || 'Turnstile verification failed');
  }

  return true;
};
