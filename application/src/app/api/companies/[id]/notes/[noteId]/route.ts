import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

const getCompanyContext = async (companyId: string, userId: string) => {
  const dbClient = await createDatabaseService();
  const company = await dbClient.company.findById(companyId);
  if (!company || company.userId !== userId) {
    return null;
  }
  return { dbClient, company };
};

const deleteNote = async (
  _request: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string; noteId: string }>
) => {
  const { id, noteId } = await paramsPromise;
  const context = await getCompanyContext(id, user.id);
  if (!context) {
    return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  await context.dbClient.companyNote.delete(noteId);
  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
};

export const DELETE = withAuth(deleteNote);
