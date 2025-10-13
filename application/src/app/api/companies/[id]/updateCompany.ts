import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

const parseOptionalDate = (value: unknown): Date | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const nullableString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export const updateCompany = async (
  request: NextRequest,
  user: { id: string; role: string },
  paramsPromise: Promise<{ id: string }>
): Promise<NextResponse> => {
  try {
    const { id } = await paramsPromise;
    const body = await request.json();
    const dbClient = await createDatabaseService();

    const existingCompany = await dbClient.company.findById(id);
    if (!existingCompany || existingCompany.userId !== user.id) {
      return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const updates: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(body, 'legalName')) {
      const legalName =
        typeof body.legalName === 'string' ? body.legalName.trim() : null;
      if (!legalName) {
        return NextResponse.json(
          { error: 'legalName cannot be empty' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      updates.legalName = legalName;
    }

    const stringFields: Array<
      | 'displayName'
      | 'industry'
      | 'ein'
      | 'website'
      | 'phone'
      | 'email'
      | 'addressLine1'
      | 'addressLine2'
      | 'city'
      | 'state'
      | 'postalCode'
      | 'country'
      | 'description'
    > = [
      'displayName',
      'industry',
      'ein',
      'website',
      'phone',
      'email',
      'addressLine1',
      'addressLine2',
      'city',
      'state',
      'postalCode',
      'country',
      'description',
    ];

    for (const field of stringFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = nullableString(body[field]);
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'formationDate')) {
      updates.formationDate = parseOptionalDate(body.formationDate);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const company = await dbClient.company.update(id, updates);

    return NextResponse.json({ company }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
