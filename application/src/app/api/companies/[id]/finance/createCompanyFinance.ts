import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { getCompanyForUser } from './shared';
import { parseFinancePayload } from './financePayload';

export const createCompanyFinance = async (
  request: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string }>
) => {
  try {
    const { id } = await paramsPromise;
    const result = await getCompanyForUser(id, user.id);

    if (!result) {
      return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const existing = await result.dbClient.companyFinance.findByCompanyId(id);
    if (existing) {
      return NextResponse.json(
        { error: 'Finance record already exists for company' },
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    const body = await request
      .json()
      .catch(() => ({}));

    const parsed = parseFinancePayload(body);
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const finance = await result.dbClient.companyFinance.create({
      companyId: id,
      ...parsed.data,
    });

    return NextResponse.json({ finance }, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    console.error('Error creating company finance record:', error);
    return NextResponse.json(
      { error: 'Failed to create company finance record' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
