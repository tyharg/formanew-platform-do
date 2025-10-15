import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createEmailService } from 'services/email/emailFactory';
import { HTTP_STATUS } from 'lib/api/http';
import { serverConfig } from 'settings';
import { createClientPortalToken } from 'lib/auth/clientPortalToken';
import { ActionButtonEmailTemplate } from 'services/email/templates/ActionButtonEmail';

const normalizeEmail = (value: unknown): string | null => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  return value.trim().toLowerCase();
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body.email);

    if (!email) {
      return NextResponse.json(
        { error: 'A valid email is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const db = await createDatabaseService();
    const relevantParties = await db.relevantParty.findByEmail(email);

    if (relevantParties.length === 0) {
      return NextResponse.json(
        { error: 'No matching relevant parties found for this email' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const token = createClientPortalToken({
      email,
      partyIds: relevantParties.map((party) => party.id),
    });

    const origin = serverConfig.baseURL || request.nextUrl.origin;
    const portalUrl = `${origin}/client-portal?token=${encodeURIComponent(token)}`;

    const emailService = await createEmailService();

    if (!emailService.isEmailEnabled()) {
      console.warn('Client portal link requested while email integration toggle is off; attempting send.');
    }

    const emailStatus = await emailService.checkConfiguration();

    if (!emailStatus.configured) {
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact an administrator.' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (emailStatus.connected === false) {
      const reason = emailStatus.error || 'Unable to connect to email provider.';
      return NextResponse.json(
        { error: reason },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    await emailService.sendReactEmail(
      email,
      'Access your FormaNew contracts',
      <ActionButtonEmailTemplate
        title="Access your FormaNew contracts"
        buttonUrl={portalUrl}
        buttonText="Open Client Portal"
        greetingText="Here's your secure link to review the contracts you're involved in."
        fallbackText="If the button above does not work, copy and paste this link into your browser:"
        fallbackUrlLabel={portalUrl}
      />
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to send client portal link', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
