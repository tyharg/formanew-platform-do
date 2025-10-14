import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { updateCompanyFinance } from '@/lib/api/companyFinance';
import Stripe from 'stripe';

/**
 * API Route to handle incoming Stripe webhook events.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  
  // We must read the raw body text before parsing it as JSON
  const rawBody = await req.text();

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ message: 'Webhook secret missing' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    // 1. Verify the event signature to ensure security
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err);
    return NextResponse.json({ message: 'Webhook signature verification failed' }, { status: 400 });
  }

  // 2. Handle the event
  const data = event.data.object;

  switch (event.type) {
    case 'account.updated':
      const account = data as Stripe.Account;
      
      // We retrieve the Company ID from the metadata we set during account creation
      const companyId = account.metadata?.companyId;

      if (companyId) {
        console.log(`Received account.updated for Company ID: ${companyId}`);
        
        // Extract relevant status fields
        const requirements = account.requirements;

        const updates = {
          stripeAccountId: account.id,
          detailsSubmitted: account.details_submitted,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          requirementsDue: requirements?.currently_due || [],
          requirementsDueSoon: requirements?.eventually_due || [],
        };

        // 3. Update the local database with the new status
        await updateCompanyFinance(companyId, updates);
        console.log(`Company finance status updated for ${companyId}. Charges enabled: ${updates.chargesEnabled}`);
      }
      break;
    
    // Add other relevant events here (e.g., 'payment_intent.succeeded' for confirmation)

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // 4. Return a 200 response to Stripe to acknowledge receipt
  return NextResponse.json({ received: true }, { status: 200 });
}
