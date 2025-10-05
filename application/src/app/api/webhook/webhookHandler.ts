/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { handleSubscriptionCreated } from './handleSubscriptionCreated';
import { handleSubscriptionDeleted } from './handleSubscriptionDeleted';
import { handleSubscriptionUpdated } from './handleSubscriptionUpdated';
import { HTTP_STATUS } from 'lib/api/http';

type WebhookAcceptedEvents =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted';

const handlers: { [key in WebhookAcceptedEvents]: (json: any) => Promise<void> } = {
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
};

/**
 * Handles incoming webhook events from Stripe.
 * It routes the event to the appropriate handler based on the event type.
 * @param event - The webhook event object containing the type and data.
 * @returns NextResponse with status 200 if handled, or 500 if an error occurs.
 */
export const webhookHandler = async (event: any) => {
  const handler = handlers[event?.type as WebhookAcceptedEvents];
  if (handler) {
    try {
      console.log('Handling webhook event: ', event?.type);
      await handler(event);
      return NextResponse.json({ status: HTTP_STATUS.OK });
    } catch (error) {
      console.error('Error handling webhook:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
  }

  console.warn('Unhandled webhook event type:', event?.type);
  return NextResponse.json({ status: HTTP_STATUS.OK });
};
