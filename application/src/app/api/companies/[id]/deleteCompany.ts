import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

export const deleteCompany = async (
  _request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string }>
): Promise<NextResponse> => {
  try {
    const { id } = await paramsPromise;
    const dbClient = await createDatabaseService();
    const company = await dbClient.company.findById(id);

    if (!company || company.userId !== user.id) {
      return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    await dbClient.company.delete(id);

    return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
