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

const getContacts = async (
  _request: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string }>
) => {
  const { id } = await paramsPromise;
  const result = await getCompanyForUser(id, user.id);
  if (!result) {
    return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  const contacts = await result.dbClient.companyContact.findByCompanyId(id);
  return NextResponse.json({ contacts }, { status: HTTP_STATUS.OK });
};

const createContact = async (
  request: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string }>
) => {
  const { id } = await paramsPromise;
  const payload = await request.json();

  const fullName = typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
  if (!fullName) {
    return NextResponse.json(
      { error: 'fullName is required' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const result = await getCompanyForUser(id, user.id);
  if (!result) {
    return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  const contact = await result.dbClient.companyContact.create({
    companyId: id,
    fullName,
    title: typeof payload.title === 'string' ? payload.title.trim() || null : null,
    email: typeof payload.email === 'string' ? payload.email.trim() || null : null,
    phone: typeof payload.phone === 'string' ? payload.phone.trim() || null : null,
    isPrimary: Boolean(payload.isPrimary),
  });

  return NextResponse.json({ contact }, { status: HTTP_STATUS.CREATED });
};

export const GET = withAuth(getContacts);
export const POST = withAuth(createContact);
