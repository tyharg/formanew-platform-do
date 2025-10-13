import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

const getCompanyForUser = async (companyId: string, userId: string) => {
  const dbClient = await createDatabaseService();
  const company = await dbClient.company.findById(companyId);
  if (!company || company.userId !== userId) {
    return null;
  }
  return { dbClient, company };
};

const createNote = async (
  request: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string }>
) => {
  const { id } = await paramsPromise;
  const context = await getCompanyForUser(id, user.id);
  if (!context) {
    return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  const payload = await request.json();
  const content = typeof payload.content === 'string' ? payload.content.trim() : '';

  if (!content) {
    return NextResponse.json(
      { error: 'content is required' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const note = await context.dbClient.companyNote.create({
    companyId: id,
    authorName: typeof payload.authorName === 'string' ? payload.authorName.trim() || null : null,
    content,
  });

  return NextResponse.json({ note }, { status: HTTP_STATUS.CREATED });
};

const getNotes = async (
  _request: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string }>
) => {
  const { id } = await paramsPromise;
  const context = await getCompanyForUser(id, user.id);
  if (!context) {
    return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  const notes = await context.dbClient.companyNote.findByCompanyId(id);
  return NextResponse.json({ notes }, { status: HTTP_STATUS.OK });
};

export const GET = withAuth(getNotes);
export const POST = withAuth(createNote);
