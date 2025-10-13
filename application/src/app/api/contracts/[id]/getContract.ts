import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

export const getContract = async (
  _request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string }>
): Promise<NextResponse> => {
  try {
    const { id } = await paramsPromise;
    const dbClient = await createDatabaseService();
    const contract = await dbClient.contract.findById(id);

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const company = await dbClient.company.findById(contract.companyId);

    if (!company || company.userId !== user.id) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    return NextResponse.json({ contract }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
