import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

export const getCompanies = async (
  _request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> => {
  try {
    const dbClient = await createDatabaseService();
    const companies = await dbClient.company.findByUserId(user.id);

    return NextResponse.json({ companies }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
