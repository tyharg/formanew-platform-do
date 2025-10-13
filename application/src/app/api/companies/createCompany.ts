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

export const createCompany = async (
  request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> => {
  try {
    const body = await request.json();

    const legalName = typeof body.legalName === 'string' ? body.legalName.trim() : '';

    if (!legalName) {
      return NextResponse.json(
        { error: 'legalName is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const dbClient = await createDatabaseService();
    const company = await dbClient.company.create({
      userId: user.id,
      legalName,
      displayName: typeof body.displayName === 'string' ? body.displayName.trim() : null,
      industry: typeof body.industry === 'string' ? body.industry.trim() : null,
      ein: typeof body.ein === 'string' ? body.ein.trim() : null,
      formationDate: parseOptionalDate(body.formationDate),
      website: typeof body.website === 'string' ? body.website.trim() : null,
      phone: typeof body.phone === 'string' ? body.phone.trim() : null,
      email: typeof body.email === 'string' ? body.email.trim() : null,
      addressLine1: typeof body.addressLine1 === 'string' ? body.addressLine1.trim() : null,
      addressLine2: typeof body.addressLine2 === 'string' ? body.addressLine2.trim() : null,
      city: typeof body.city === 'string' ? body.city.trim() : null,
      state: typeof body.state === 'string' ? body.state.trim() : null,
      postalCode: typeof body.postalCode === 'string' ? body.postalCode.trim() : null,
      country: typeof body.country === 'string' ? body.country.trim() : null,
      description: typeof body.description === 'string' ? body.description.trim() : null,
    });

    return NextResponse.json({ company }, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
