import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { serverConfig } from 'settings';

export interface ClientPortalTokenPayload extends JwtPayload {
  email: string;
  partyIds: string[];
}

const getSecret = (): string => {
  const secret = serverConfig.ClientPortal.jwtSecret;
  if (!secret) {
    throw new Error('Client portal JWT secret is not configured');
  }

  return secret;
};

const getExpiryMinutes = (): number => {
  const minutes = serverConfig.ClientPortal.tokenExpiryMinutes;
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 60;
};

export const createClientPortalToken = (payload: {
  email: string;
  partyIds: string[];
}): string => {
  const secret = getSecret();
  const expiresInSeconds = getExpiryMinutes() * 60;

  const signOptions: SignOptions = {
    expiresIn: expiresInSeconds,
  };

  return jwt.sign(
    {
      email: payload.email,
      partyIds: payload.partyIds,
    },
    secret,
    signOptions
  );
};

export const verifyClientPortalToken = (token: string): ClientPortalTokenPayload => {
  const secret = getSecret();
  const decoded = jwt.verify(token, secret);

  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid client portal token');
  }

  const { email, partyIds } = decoded as ClientPortalTokenPayload;

  if (!email || !Array.isArray(partyIds)) {
    throw new Error('Client portal token payload is missing required fields');
  }

  return decoded as ClientPortalTokenPayload;
};
