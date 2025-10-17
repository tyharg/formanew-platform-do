import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { HTTP_STATUS } from 'lib/api/http';
import { verifyClientPortalToken } from 'lib/auth/clientPortalToken';
import { prisma } from 'lib/prisma';

const toIsoString = (value: Date | null) => (value ? value.toISOString() : null);

interface Params {
  contractId: string;
  companyId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { contractId } = await params;
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
    } catch {
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
    const authorizedParty = partiesFromToken.find((party) => {
      return (
        party.email.trim().toLowerCase() === sanitizedEmail &&
        party.contractId === contractId
      );
    });

    if (!authorizedParty) {
      return NextResponse.json(
        { error: 'Token does not grant access to this contract' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        company: {
          select: {
            id: true,
            legalName: true,
            displayName: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
        relevantParties: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            phone: true,
          },
        },
        workItems: {
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        },
        files: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const response = {
      id: contract.id,
      title: contract.title,
      description: contract.description,
      status: contract.status,
      counterpartyName: contract.counterpartyName,
      counterpartyEmail: contract.counterpartyEmail,
      contractValue: contract.contractValue,
      currency: contract.currency,
      startDate: toIsoString(contract.startDate),
      endDate: toIsoString(contract.endDate),
      signedDate: toIsoString(contract.signedDate),
      paymentTerms: contract.paymentTerms,
      renewalTerms: contract.renewalTerms,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
      company: contract.company
        ? {
            id: contract.company.id,
            legalName: contract.company.legalName,
            displayName: contract.company.displayName,
            addressLine1: contract.company.addressLine1,
            addressLine2: contract.company.addressLine2,
            city: contract.company.city,
            state: contract.company.state,
            postalCode: contract.company.postalCode,
            country: contract.company.country,
          }
        : null,
      relevantParties: contract.relevantParties,
      workItems: contract.workItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        dueDate: toIsoString(item.dueDate),
        completedAt: toIsoString(item.completedAt),
        position: item.position,
      })),
      files: contract.files.map((file) => ({
        id: file.id,
        name: file.name,
        description: file.description,
        contentType: file.contentType,
        size: file.size,
        createdAt: file.createdAt.toISOString(),
      })),
      isBillingEnabled: contract.isBillingEnabled,
      stripePriceId: contract.stripePriceId,
      billingAmount: contract.billingAmount,
      billingCurrency: contract.billingCurrency,
    };

    return NextResponse.json({ contract: response });
  } catch (error) {
    console.error('Failed to load contract details for client portal', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
