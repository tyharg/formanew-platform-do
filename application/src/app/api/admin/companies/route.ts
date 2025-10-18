import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { USER_ROLES } from 'lib/auth/roles';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';

const getAllCompanies = async (_req: NextRequest) => {
  const db = await createDatabaseService();
  const companies = await db.company.findAll();
  return NextResponse.json({ companies }, { status: HTTP_STATUS.OK });
};

export const GET = withAuth(getAllCompanies, { allowedRoles: [USER_ROLES.ADMIN] });
