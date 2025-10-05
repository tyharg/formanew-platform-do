/* eslint-disable  @typescript-eslint/no-explicit-any */
import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionPlanEnum } from 'types';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';

/**
 * Function to update subscriptions
 * @param sub subscription data
 * @param id user id
 * @returns void or NextResponse in case of error
 */
const updateSubscription = async (sub: any, id: string) => {
  const billing = await createBillingService();
  const dbClient = await createDatabaseService();

  if (sub.plan === SubscriptionPlanEnum.PRO) {
    const existingSubscription = await dbClient.subscription.findByUserId(id);
    if (
      !existingSubscription ||
      !existingSubscription.length ||
      !existingSubscription[0].customerId
    ) {
      console.error('No existing subscription found for user');
      throw new Error('No existing subscription found for user');
    }

    const existingStripeSubscription = await billing.listSubscription(
      existingSubscription[0].customerId
    );

    await billing.updateSubscription(
      existingStripeSubscription[0].id,
      existingStripeSubscription[0].items[0].id,
      'GIFT'
    );
  }

  if (sub.plan === SubscriptionPlanEnum.FREE) {
    const existingSubscription = await dbClient.subscription.findByUserId(id);

    if (
      !existingSubscription ||
      !existingSubscription.length ||
      !existingSubscription[0].customerId
    ) {
      console.error('No existing subscription found for user');
      throw new Error('No existing subscription found for user');
    }

    const existingStripeSubscription = await billing.listSubscription(
      existingSubscription[0].customerId
    );

    await billing.updateSubscription(
      existingStripeSubscription[0].id,
      existingStripeSubscription[0].items[0].id,
      SubscriptionPlanEnum.FREE
    );
  }

  await dbClient.subscription.update(id, sub);
};

/**
 * Updates a user with the provided data in the request body.
 * Only allows updating specific fields: name, role, and subscriptions.
 *
 * @param request - The Next.js request object containing user update data.
 * @returns A NextResponse with the updated user or an error message.
 */
export const editUser = async (
  request: NextRequest,
  user: { id: string; role: string },
  params: Promise<{ id: string | undefined }>
): Promise<NextResponse> => {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = body;
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Only allow updating specific fields (e.g., name, email, role)
    const allowedFields = ['name', 'role', 'subscription'];

    // Remove fields from updateData that are not allowed
    Object.keys(updateData).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      }
    });
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const dbClient = await createDatabaseService();
    const updatedUser = await dbClient.user.update(id, {
      name: updateData.name,
      role: updateData.role,
    });

    if (updateData.subscription) {
      try {
        await updateSubscription(updateData.subscription, id);
      } catch (error) {
        return NextResponse.json(
          { error: (error as Error).message },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error(
      'Unexpected error in updateUser',
      (error as { message: string }).message ? (error as { message: string }).message : error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
