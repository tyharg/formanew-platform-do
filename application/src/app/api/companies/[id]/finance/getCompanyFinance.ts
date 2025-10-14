import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { getCompanyForUser } from './shared';

export const getCompanyFinance = async (
  _request: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string }>
) => {
  try {
    const { id } = await paramsPromise;
    const result = await getCompanyForUser(id, user.id);

    if (!result) {
      return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const finance = await result.dbClient.companyFinance.findByCompanyId(id);
    return NextResponse.json({ finance: finance ?? null }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error fetching company finance record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company finance record' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
