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

const updateContact = async (
  request: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string; contactId: string }>
) => {
  const { id, contactId } = await paramsPromise;
  const context = await getCompanyContext(id, user.id);
  if (!context) {
    return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  const updates: Record<string, unknown> = {};
  const payload = await request.json();

  if (Object.prototype.hasOwnProperty.call(payload, 'fullName')) {
    const name = typeof payload.fullName === 'string' ? payload.fullName.trim() : '';
    if (!name) {
      return NextResponse.json(
        { error: 'fullName cannot be empty' },
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }
    updates.fullName = name;
  }

  const optionalFields: Array<'title' | 'email' | 'phone'> = ['title', 'email', 'phone'];
  optionalFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      const value = typeof payload[field] === 'string' ? payload[field].trim() : '';
      updates[field] = value.length ? value : null;
    }
  });

  if (Object.prototype.hasOwnProperty.call(payload, 'isPrimary')) {
    updates.isPrimary = Boolean(payload.isPrimary);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields provided for update' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const contact = await context.dbClient.companyContact.update(contactId, updates);
  return NextResponse.json({ contact }, { status: HTTP_STATUS.OK });
};

const deleteContact = async (
  _request: NextRequest,
  user: { id: string },
  paramsPromise: Promise<{ id: string; contactId: string }>
) => {
  const { id, contactId } = await paramsPromise;
  const context = await getCompanyContext(id, user.id);
  if (!context) {
    return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  await context.dbClient.companyContact.delete(contactId);
  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
};

export const PUT = withAuth(updateContact);
export const DELETE = withAuth(deleteContact);
