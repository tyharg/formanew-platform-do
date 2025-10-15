import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';
import { verifyClientPortalToken } from 'lib/auth/clientPortalToken';
import { prisma } from 'lib/prisma';

const toIsoString = (value: Date | null) => (value ? value.toISOString() : null);

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    let payload;
    try {
      payload = verifyClientPortalToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const db = await createDatabaseService();
    const partiesFromToken = await db.relevantParty.findByIds(payload.partyIds);

    if (partiesFromToken.length === 0) {
      return NextResponse.json(
        { error: 'No matching relevant parties found for this token' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const sanitizedEmail = payload.email.trim().toLowerCase();
    const tokenEmailMatches = partiesFromToken.some(
      (party) => party.email.trim().toLowerCase() === sanitizedEmail
    );

    if (!tokenEmailMatches) {
      return NextResponse.json(
        { error: 'Token does not match any relevant party' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const relevantParties = await db.relevantParty.findByEmail(payload.email);

    if (relevantParties.length === 0) {
      return NextResponse.json(
        { error: 'No contracts found for this email' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const contractIds = Array.from(new Set(relevantParties.map((party) => party.contractId)));

    const contracts = await prisma.contract.findMany({
      where: { id: { in: contractIds } },
      include: {
        company: {
          select: {
            id: true,
            legalName: true,
            displayName: true,
          },
        },
        relevantParties: {
          where: { email: { equals: payload.email, mode: 'insensitive' } },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const response = contracts.map((contract) => ({
      id: contract.id,
      title: contract.title,
      status: contract.status,
      counterpartyName: contract.counterpartyName,
      counterpartyEmail: contract.counterpartyEmail,
      contractValue: contract.contractValue,
      currency: contract.currency,
      startDate: toIsoString(contract.startDate),
      endDate: toIsoString(contract.endDate),
      signedDate: toIsoString(contract.signedDate),
      company: contract.company
        ? {
            id: contract.company.id,
            legalName: contract.company.legalName,
            displayName: contract.company.displayName,
          }
        : null,
      relevantParty: contract.relevantParties[0] || null,
      description: contract.description,
      paymentTerms: contract.paymentTerms,
      renewalTerms: contract.renewalTerms,
      updatedAt: contract.updatedAt.toISOString(),
      createdAt: contract.createdAt.toISOString(),
    }));

    return NextResponse.json({ contracts: response });
  } catch (error) {
    console.error('Failed to load client portal contracts', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
