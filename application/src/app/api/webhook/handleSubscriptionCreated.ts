/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createDatabaseService } from 'services/database/databaseFactory';
import { SubscriptionStatusEnum } from 'types';

/**
 * Handles the creation of a subscription.
 * Updates the subscription status to ACTIVE in the database.
 *
 * @param json - The JSON payload from the webhook event.
 * @throws Will throw an error if customer ID is not provided.
 */
export const handleSubscriptionCreated = async (json: any) => {
  const customerId = json.data.object.customer;

  if (!customerId) {
    throw new Error('Customer ID is required');
  }

  const db = await createDatabaseService();

  await db.subscription.updateByCustomerId(customerId, {
    status: SubscriptionStatusEnum.ACTIVE,
  });
};
