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

export const createContract = async (
  request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const companyId = typeof body.companyId === 'string' ? body.companyId : null;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const counterpartyName =
      typeof body.counterpartyName === 'string' ? body.counterpartyName.trim() : '';

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (!counterpartyName) {
      return NextResponse.json(
        { error: 'counterpartyName is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const dbClient = await createDatabaseService();
    const company = await dbClient.company.findById(companyId);

    if (!company || company.userId !== user.id) {
      return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    let status: ContractStatus | undefined;
    if (typeof body.status === 'string') {
      if ((Object.values(ContractStatus) as string[]).includes(body.status)) {
        status = body.status as ContractStatus;
      } else {
        return NextResponse.json(
          { error: 'Invalid contract status' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }

    const contract = await dbClient.contract.create({
      companyId,
      title,
      counterpartyName,
      counterpartyEmail: nullableString(body.counterpartyEmail),
      contractValue: parseOptionalNumber(body.contractValue),
      currency: nullableString(body.currency) ?? 'USD',
      status: status ?? ContractStatus.DRAFT,
      startDate: parseOptionalDate(body.startDate),
      endDate: parseOptionalDate(body.endDate),
      signedDate: parseOptionalDate(body.signedDate),
      paymentTerms: nullableString(body.paymentTerms),
      renewalTerms: nullableString(body.renewalTerms),
      description: nullableString(body.description),
    });

    return NextResponse.json({ contract }, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
