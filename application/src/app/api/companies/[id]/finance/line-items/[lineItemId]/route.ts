import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

const deleteLineItem = async (
  _req: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string; lineItemId: string }>
) => {
  const { id: companyId, lineItemId } = await paramsPromise;
  const db = await createDatabaseService();

  const company = await db.company.findById(companyId);
  if (!company || company.userId !== user.id) {
    return NextResponse.json({ error: 'Company not found.' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  await db.financeLineItem.delete(companyId, lineItemId);
  return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
};

export const DELETE = withAuth(deleteLineItem);
