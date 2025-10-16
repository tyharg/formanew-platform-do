import { withAuth } from 'lib/auth/withAuth';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';

export const PUT = withAuth(
  async (
    request: NextRequest,
    user: { id: string; role: string },
    paramsPromise: Promise<{ companyId: string; id: string }>
  ) => {
    try {
      const { companyId, id } = await paramsPromise;
      const db = await createDatabaseService();
      const company = await db.company.findById(companyId);

      if (!company || company.userId !== user.id) {
        return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
      }

      const body = await request.json();
      const incorporation = await db.incorporation.update(id, body);

      return NextResponse.json({ incorporation });
    } catch (error) {
      console.error('Failed to update incorporation data', error);
      return NextResponse.json(
        { error: (error as Error).message || 'Internal server error' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
  }
);
