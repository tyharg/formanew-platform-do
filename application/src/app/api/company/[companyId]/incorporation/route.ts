import { withAuth } from 'lib/auth/withAuth';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';

export const GET = withAuth(
  async (
    _request: NextRequest,
    user: { id: string; role: string },
    paramsPromise: Promise<{ companyId: string }>
  ) => {
    try {
      const { companyId } = await paramsPromise;
      const db = await createDatabaseService();
      const company = await db.company.findById(companyId);

      if (!company || company.userId !== user.id) {
        return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
      }

      const incorporation = await db.incorporation.findByCompanyId(companyId);

      return NextResponse.json({ incorporation });
    } catch (error) {
      console.error('Failed to fetch incorporation data', error);
      return NextResponse.json(
        { error: (error as Error).message || 'Internal server error' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
  }
);

export const POST = withAuth(
  async (
    request: NextRequest,
    user: { id: string; role: string },
    paramsPromise: Promise<{ companyId: string }>
  ) => {
    try {
      const { companyId } = await paramsPromise;
      const db = await createDatabaseService();
      const company = await db.company.findById(companyId);

      if (!company || company.userId !== user.id) {
        return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
      }

      const body = await request.json();
      const incorporation = await db.incorporation.create({ ...body, companyId });

      return NextResponse.json({ incorporation });
    } catch (error) {
      console.error('Failed to create incorporation data', error);
      return NextResponse.json(
        { error: (error as Error).message || 'Internal server error' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
  }
);
