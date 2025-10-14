import type { CompanyFinance } from 'types';

export type FinanceUpdateData = Partial<
  Omit<CompanyFinance, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
>;

type ParseSuccess = {
  data: FinanceUpdateData;
};

type ParseFailure = {
  error: string;
};

const parseNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error('must be a string or null');
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const parseBoolean = (value: unknown): boolean => {
  if (typeof value !== 'boolean') {
    throw new Error('must be a boolean');
  }
  return value;
};

const parseStringArray = (value: unknown): string[] => {
  if (value === null || value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('must be an array of strings');
  }

  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') {
      throw new Error('must be an array of strings');
    }
    const trimmed = item.trim();
    if (trimmed.length > 0) {
      result.push(trimmed);
    }
  }
  return result;
};

const parseDate = (value: unknown): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error('must be an ISO date string or null');
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('must be a valid ISO date string');
  }
  return parsed;
};

export const parseFinancePayload = (payload: unknown): ParseSuccess | ParseFailure => {
  if (!payload || typeof payload !== 'object') {
    return { error: 'Invalid request payload.' };
  }

  const input = payload as Record<string, unknown>;
  const data: FinanceUpdateData = {};

  const assignValue = <K extends keyof FinanceUpdateData>(
    key: K,
    parser: () => FinanceUpdateData[K],
    errorMessage: string
  ) => {
    try {
      const value = parser();
      data[key] = value;
    } catch {
      throw new Error(errorMessage);
    }
  };

  try {
    if ('stripeAccountId' in input) {
      assignValue(
        'stripeAccountId',
        () => parseNullableString(input.stripeAccountId),
        'stripeAccountId must be a string or null'
      );
    }

    if ('accountOnboardingUrl' in input) {
      assignValue(
        'accountOnboardingUrl',
        () => parseNullableString(input.accountOnboardingUrl),
        'accountOnboardingUrl must be a string or null'
      );
    }

    if ('accountOnboardingExpiresAt' in input) {
      assignValue(
        'accountOnboardingExpiresAt',
        () => parseDate(input.accountOnboardingExpiresAt),
        'accountOnboardingExpiresAt must be a valid ISO date string or null'
      );
    }

    if ('accountLoginLinkUrl' in input) {
      assignValue(
        'accountLoginLinkUrl',
        () => parseNullableString(input.accountLoginLinkUrl),
        'accountLoginLinkUrl must be a string or null'
      );
    }

    if ('detailsSubmitted' in input) {
      assignValue(
        'detailsSubmitted',
        () => parseBoolean(input.detailsSubmitted),
        'detailsSubmitted must be a boolean'
      );
    }

    if ('chargesEnabled' in input) {
      assignValue(
        'chargesEnabled',
        () => parseBoolean(input.chargesEnabled),
        'chargesEnabled must be a boolean'
      );
    }

    if ('payoutsEnabled' in input) {
      assignValue(
        'payoutsEnabled',
        () => parseBoolean(input.payoutsEnabled),
        'payoutsEnabled must be a boolean'
      );
    }

    if ('requirementsDue' in input) {
      assignValue(
        'requirementsDue',
        () => parseStringArray(input.requirementsDue),
        'requirementsDue must be an array of strings'
      );
    }

    if ('requirementsDueSoon' in input) {
      assignValue(
        'requirementsDueSoon',
        () => parseStringArray(input.requirementsDueSoon),
        'requirementsDueSoon must be an array of strings'
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid value';
    return { error: message };
  }

  return { data };
};
