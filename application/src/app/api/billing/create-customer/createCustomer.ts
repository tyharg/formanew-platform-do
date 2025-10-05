import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createBillingService } from 'services/billing/billingFactory';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Creates a customer in the billing system.
 *
 * @param user - The user object containing id and role and email.
 */
export const createCustomer = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    const billingService = await createBillingService();

    const customers = await billingService.listCustomer(user.email);

    if (customers.length > 0) {
      return NextResponse.json({ customerId: customers[0].id });
    }

    const customer = await billingService.createCustomer(user.email, {
      userId: user.email,
    });

    const db = await createDatabaseService();
    await db.subscription.create({
      customerId: customer.id,
      plan: null,
      status: null,
      userId: user.id,
    });

    return NextResponse.json({ customerId: customer.id });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
