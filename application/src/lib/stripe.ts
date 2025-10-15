import Stripe from 'stripe';

// --- Configuration ---
// NOTE: Replace 'sk_test_...' with your actual Stripe Secret Key.
// This key must be your Platform's secret key, not the connected account's key.
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// NOTE: Replace 'pk_test_...' with your actual Stripe Publishable Key.
// This key is used client-side for Stripe.js initialization.
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// NOTE: Webhook secret for verifying incoming events.
// You must configure a webhook endpoint in your Stripe dashboard pointing to 
// YOUR_BASE_URL/api/stripe/webhook and subscribe to 'account.updated' events.
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// The API version requested by the user.
// TODO: Set STRIPE_SECRET_KEY in your environment (e.g., sk_test_123) before running this demo.
const API_VERSION = '2025-09-30.clover' as Stripe.StripeConfig['apiVersion'];

// --- Initialization ---

if (!STRIPE_SECRET_KEY) {
  // Helpful error message if the secret key is missing
  throw new Error(
    '❌ STRIPE_SECRET_KEY is not set in environment variables. ' +
    'Please set it to your platform\'s secret key (starts with sk_test_ or sk_live_).'
  );
}

/**
 * Stripe client initialized with the platform's secret key and the specified API version.
 * All API calls for connected accounts must use the { stripeAccount: accountId } option.
 */
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: API_VERSION,
  typescript: true,
});

/**
 * Helper function to ensure the connected account ID is valid before making Stripe calls.
 * @param accountId The Stripe Connect Account ID (acct_...)
 */
export function validateStripeAccountId(accountId: string): boolean {
  return accountId.startsWith('acct_');
}
