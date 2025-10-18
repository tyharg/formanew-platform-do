import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const db = await createDatabaseService();
    const company = await db.company.findById(companyId);

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const finance = company.finance ?? (await db.companyFinance.findByCompanyId(companyId));

    return NextResponse.json(
      {
        company: {
          id: company.id,
          name: company.displayName ?? company.legalName,
          description: company.description,
        },
        storefront: {
          stripeAccountId: finance?.stripeAccountId ?? null,
          chargesEnabled: Boolean(finance?.chargesEnabled),
        },
      },
      { status: HTTP_STATUS.OK },
    );
  } catch (error) {
    console.error('Failed to load public storefront info', error);
    return NextResponse.json(
      { error: 'Unable to load storefront information.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
