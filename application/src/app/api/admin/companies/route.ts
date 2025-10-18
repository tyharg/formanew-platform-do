import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { USER_ROLES } from 'lib/auth/roles';
import { HTTP_STATUS } from 'lib/api/http';
import { prisma } from 'lib/prisma';

export const GET = withAuth(
  async (_req: NextRequest, _user: { id: string }) => {
    try {
      const companies = await prisma.company.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          finance: true,
          contracts: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const payload = companies.map((company) => ({
        id: company.id,
        name: company.displayName ?? company.legalName,
        legalName: company.legalName,
        createdAt: company.createdAt,
        ownerName: company.user?.name ?? '—',
        ownerEmail: company.user?.email ?? '—',
        stripeAccountId: company.finance?.stripeAccountId ?? null,
        chargesEnabled: Boolean(company.finance?.chargesEnabled),
        contractCount: company.contracts?.length ?? 0,
        state: company.state,
      }));

      return NextResponse.json({ companies: payload }, { status: HTTP_STATUS.OK });
    } catch (error) {
      console.error('Failed to load admin companies', error);
      return NextResponse.json(
        { error: 'Unable to load companies.' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
      );
    }
  },
  { allowedRoles: [USER_ROLES.ADMIN] },
);
