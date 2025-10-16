import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { ContractStatus } from 'types';

const nullableString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const parseOptionalDate = (value: unknown): Date | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const parseOptionalNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

export const updateContract = async (
  request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string }>
): Promise<NextResponse> => {
  try {
    const { id } = await paramsPromise;
    const body = await request.json();
    const dbClient = await createDatabaseService();

    const existingContract = await dbClient.contract.findById(id);
    if (!existingContract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const owningCompany = await dbClient.company.findById(existingContract.companyId);
    if (!owningCompany || owningCompany.userId !== user.id) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const updates: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(body, 'title')) {
      const title = typeof body.title === 'string' ? body.title.trim() : null;
      if (!title) {
        return NextResponse.json(
          { error: 'title cannot be empty' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      updates.title = title;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'counterpartyName')) {
      const counterpartyName =
        typeof body.counterpartyName === 'string' ? body.counterpartyName.trim() : null;
      if (!counterpartyName) {
        return NextResponse.json(
          { error: 'counterpartyName cannot be empty' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      updates.counterpartyName = counterpartyName;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'counterpartyEmail')) {
      updates.counterpartyEmail = nullableString(body.counterpartyEmail);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'contractValue')) {
      updates.contractValue = parseOptionalNumber(body.contractValue);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'currency')) {
      updates.currency = nullableString(body.currency);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'status')) {
      if (typeof body.status !== 'string') {
        return NextResponse.json(
          { error: 'Invalid contract status' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }

      if (!(Object.values(ContractStatus) as string[]).includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid contract status' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }

      updates.status = body.status as ContractStatus;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'startDate')) {
      updates.startDate = parseOptionalDate(body.startDate);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'endDate')) {
      updates.endDate = parseOptionalDate(body.endDate);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'signedDate')) {
      updates.signedDate = parseOptionalDate(body.signedDate);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'paymentTerms')) {
      updates.paymentTerms = nullableString(body.paymentTerms);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'renewalTerms')) {
      updates.renewalTerms = nullableString(body.renewalTerms);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'description')) {
      updates.description = nullableString(body.description);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'isBillingEnabled')) {
      if (typeof body.isBillingEnabled === 'boolean') {
        updates.isBillingEnabled = body.isBillingEnabled;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'stripePriceId')) {
      updates.stripePriceId = nullableString(body.stripePriceId);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'billingAmount')) {
      updates.billingAmount = parseOptionalNumber(body.billingAmount);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'billingCurrency')) {
      updates.billingCurrency = nullableString(body.billingCurrency);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const contract = await dbClient.contract.update(id, updates);

    return NextResponse.json({ contract }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
