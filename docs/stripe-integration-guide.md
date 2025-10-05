# Stripe Integration Guide

This guide walks you through setting up Stripe billing for your SaaS application.

## Overview

This project uses Stripe for subscription billing and includes an automated setup script that will:

- **Create billing products** (Free and Pro plans) in your Stripe account
- **Set up entitlement features** (e.g., usage limits, premium features)
- **Configure pricing tiers** including gift subscriptions
- **Set up the billing portal** for customer self-service
- **Update your `.env` file** with all necessary API keys and IDs

**Why this is needed:** Instead of manually creating each product, price, and feature in the Stripe dashboard (which is time-consuming and error-prone), this script automates the entire process and ensures your application has all the correct environment variables to work with Stripe.

## What You'll Need

- A Stripe account (free to create)
- Your Stripe test secret key (`sk_test_...`)
- Node.js and npm installed
- About 5 minutes
- A modern browser (Chrome, Firefox, Safari, or Edge)

## Step-by-Step Setup

### Step 1: Get Your Stripe API Key

If you don't have a Stripe account yet:

1. Go to [Stripe](https://dashboard.stripe.com/register) and create a new account
2. Complete the account setup process

Once you have a Stripe account:

1. **Switch to Test mode** - Click your account name in the left sidebar → "Switch to Test mode"
   - Or go directly to: [https://dashboard.stripe.com/test](https://dashboard.stripe.com/test)
2. **Get your API key** - Go to **Developers** → **API keys**
   - Or go directly to: [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
3. **Copy the Secret Key** (starts with `sk_test_...`) - you'll need this for the next step


### Step 2: Install Dependencies

Make sure you have the project dependencies installed:

```bash
npm install
```

### Step 3: Run the Setup Script

From your project root, run:

```bash
npm run setup:stripe
```

The script will:

1. **Prompt for your Stripe Secret Key** (paste the `sk_test_...` key from Step 1)
2. **Validate the key** and connect to your Stripe account
3. **Create billing products** (Free and Pro plans)
4. **Set up entitlement features** and link them to products
5. **Configure the billing portal** for customer self-service
6. **Update your `.env` file** with all the generated IDs

#### What Gets Added to Your `.env` File

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PORTAL_CONFIG_ID=bpc_...
STRIPE_FREE_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PRO_GIFT_PRICE_ID=price_...
```

### Step 4: View Created Products in Stripe Dashboard

After running the setup script, you can view the products that were created in your Stripe dashboard:

1. Go to [https://dashboard.stripe.com/test/products?active=true](https://dashboard.stripe.com/test/products?active=true)
2. You should see the following products:
   - **Free Plan** - $0/month with basic features (50 notes limit, basic sync)
   - **Pro Plan** - $12/month with premium features (unlimited notes, real-time sync, etc.)

> **Note:** The Stripe Dashboard requires a modern browser (Chrome, Firefox, Safari, or Edge). If you see a compatibility warning, please switch to a supported browser.

### Step 5: Configure Webhooks

Now that you have your products and pricing set up, the final step is to configure webhooks. This step is crucial for keeping your application in sync with Stripe's billing events.

**What are webhooks and why do you need them?**
Webhooks are how Stripe notifies your application when important events happen, such as:

- When a customer's subscription is created
- When a subscription is updated (e.g., plan changes, payment method updates)
- When a subscription is canceled

Without webhooks, your application won't know when these events occur, leading to inconsistencies between your database and Stripe's records. For example, if a customer cancels their subscription directly in the Stripe customer portal, your application needs to be notified to update their access permissions.

**When do you need this?**

- **Required for production:** Webhooks must be set up before going live
- **Recommended for development:** While optional for basic testing, webhooks help ensure your subscription flow works end-to-end

#### Webhook Setup Options

You have different options for setting up webhooks depending on whether you're in production or development:

1. **For Production:** Configure webhooks in the Stripe dashboard pointing to your deployed app URL
2. **For Local Development:** Use either the Stripe CLI (recommended) or ngrok

#### Option A: Production Webhook Setup (Deployed App)

**Prerequisites:**

- Your application must be deployed with a public URL
- You need access to your Stripe dashboard

**Steps:**

1. Get your deployed app URL (e.g., `https://your-app-name.ondigitalocean.app`)
   - For DigitalOcean: Log in to your [dashboard](https://cloud.digitalocean.com/), go to **Apps**, select your app, and copy the URL from **Domains**
2. Go to the [Stripe dashboard](https://dashboard.stripe.com/test/webhooks) and click **Add endpoint**
3. Enter your app URL with `/api/webhook` suffix (e.g., `https://your-app-name.ondigitalocean.app/api/webhook`)
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

#### Option B: Local Development with Stripe CLI (Recommended)

The Stripe CLI is the easiest way to test webhooks locally. It creates a direct connection between Stripe and your local server without needing a public URL.

**Prerequisites:**

- [Install the Stripe CLI](https://stripe.com/docs/stripe-cli)
- Your local server running (typically on port 3000)

**Steps:**

1. Log in to your Stripe account via the CLI:
   ```bash
   stripe login
   ```
2. Start the webhook forwarding:
   ```bash
   stripe listen --events customer.subscription.created,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/webhook
   ```
3. The CLI will display a webhook signing secret. Copy this and set it as your `STRIPE_WEBHOOK_SECRET` environment variable:
   ```
   export STRIPE_WEBHOOK_SECRET=whsec_abc123...
   # or add to your .env file
   ```

**Benefits of this approach:**

- No manual webhook configuration in the Stripe dashboard
- No need for a public URL
- Automatically forwards only the events you specify
- Works behind firewalls and on local networks

#### Option C: Local Development with ngrok

If you prefer or can't use the Stripe CLI, you can use ngrok to create a temporary public URL for your local server.

**Prerequisites:**

- [Install ngrok](https://ngrok.com/download)
- Your local server running (typically on port 3000)

**Steps:**

1. Start ngrok to create a tunnel to your local server:
   ```bash
   ngrok http 3000
   ```
2. Copy the HTTPS URL provided by ngrok (e.g., `https://abc123.ngrok.io`)
3. Follow the same steps as Option A (Production Setup), but use your ngrok URL instead
4. Remember that ngrok URLs expire when you stop ngrok, so you'll need to update your webhook in the Stripe dashboard each time you restart ngrok

> **Note for local development:** While webhooks are required for production, you can test basic functionality without them during development. However, subscription status changes won't be automatically reflected in your application without webhook integration.

---

## Testing Your Stripe Integration

After setting up your products and configuring webhooks, it's important to test the entire subscription flow to ensure everything is working correctly. This section walks you through testing your Stripe integration end-to-end.

### Step 1: Create a Test User Account

1. Start your application in development mode:
   ```bash
   npm run dev
   ```
2. Open your application in a browser (typically at `http://localhost:3000`)
3. Navigate to the signup page and **create a new test user account**
4. Complete the signup process and log in

### Step 2: Verify Customer Creation in Stripe

1. Go to the [Stripe Dashboard Customers section](https://dashboard.stripe.com/test/customers)
2. You should see a new customer entry with the email address you used to sign up
3. Click on the customer to view their details
4. Note that the customer starts with no subscription (or a free subscription if your app automatically assigns one)

### Step 3: Test Subscription Upgrade

1. In your application, navigate to the **Billing** page
2. Select a paid plan (e.g., the Pro plan) and click to upgrade
3. Complete the checkout process using Stripe's test card information:
   - Card number: `4242 4242 4242 4242`
   - Expiration date: Any future date (e.g., `12/29`)
   - CVC: Any 3 digits (e.g., `123`)
   - Postal code: Any 5 digits (e.g., `12345`)

### Step 4: Verify Subscription in Stripe Dashboard

1. Return to the [Stripe Dashboard Customers section](https://dashboard.stripe.com/test/customers)
2. Find and click on your test customer
3. You should now see an active subscription in the customer details
4. Click on the subscription to view its details, including:
   - The selected plan
   - Billing period
   - Payment status

### Step 5: Test Subscription Management

1. In your application, navigate to the **Billing** page
2. Test changing subscription plans:
   - Upgrade to a higher tier (if available)
   - Downgrade to a lower tier
   - Cancel the subscription
3. After each change, check the Stripe Dashboard to verify the subscription was updated correctly

### Step 6: Test Webhook Events (If Configured)

If you've set up webhooks using the Stripe CLI or ngrok:

1. Make subscription changes as described in Step 5
2. Watch your terminal where the Stripe CLI is running to see events being forwarded
3. Check your application logs to verify the webhook events are being processed
4. Verify that your application's database is updated correctly after each subscription change

### Troubleshooting Integration Issues

- **Customer not created in Stripe:** Check your signup flow and ensure the Stripe customer creation API call is working
- **Subscription not updating:** Verify your webhook configuration and check for errors in your webhook handler
- **Payment failing:** Make sure you're using valid [test card numbers](https://stripe.com/docs/testing#cards)
- **Permissions not updating:** Check that your application correctly processes subscription status changes

---

## [Optional] Adding Custom Products

Want to add your own subscription tiers beyond the default Free and Pro plans? This section walks you through adding a custom product to Stripe and integrating it with your application.

### Step 1: Create a New Product in Stripe

You have two options for creating a new product:

#### Option A: Using the Setup Script (Recommended)

1. Open `./setup/stripe-config.json` in your editor
2. Add the new features to the `features` array, for example:

```json
{
  "features": [
    // Existing features
    { "key": "real-time-collaboration", "name": "Real-time collaboration" },
    { "key": "custom-integrations", "name": "Custom integrations" },
    { "key": "dedicated-account-manager", "name": "Dedicated account manager" }
  ]
}
```

3. Add your new products to the `products` array:

```json
{
  "products": [
    // Existing products...
    {
      "id": "ENTERPRISE_MONTHLY",
      "name": "Enterprise Plan Monthly",
      "description": "For large teams with advanced needs",
      "currency": "usd",
      "features": [
        "unlimited-notes",
        "real-time-collaboration",
        "priority-support",
        "custom-integrations",
        "dedicated-account-manager"
      ],
      "price": 4900,
      "interval": "month"
    },
    {
      "id": "ENTERPRISE_YEARLY",
      "name": "Enterprise Plan Yearly",
      "description": "For large teams with advanced needs",
      "currency": "usd",
      "features": [
        "unlimited-notes",
        "real-time-collaboration",
        "priority-support",
        "custom-integrations",
        "dedicated-account-manager"
      ],
      "price": 49000,
      "interval": "year"
    }
  ]
}
```

3. Run the setup script again:

```bash
npm run setup:stripe
```

4. The script will create your new product and add the price IDs to your `.env` file

#### Option B: Using the Stripe Dashboard

1. Go to [https://dashboard.stripe.com/test/products/create](https://dashboard.stripe.com/test/products/create)
2. Fill in the product details:
   - **Name:** Your product name (e.g., "Enterprise Plan")
   - **Description:** A brief description of the product
3. Under **Pricing**, add your price information:
   - **Price:** The amount to charge (e.g., $49.00)
   - **Recurring:** Select the billing interval (e.g., monthly)
4. Click **Add another price** if you want to add more pricing options (e.g., yearly)
5. Click **Save product**
6. After creation, click on the price to view its details
7. Copy the **Price ID** (starts with `price_...`)
8. Add this ID to your `.env` file with a descriptive name:

```
STRIPE_ENTERPRISE_PRICE_ID=price_abc123...
```

### Step 2: Update Your Application Code

Now you need to integrate your new product with your application:

#### 1. Add the Price ID to Your Settings

Open `src/settings.ts` and add your new price ID, for example with the monthly price ID:

```typescript
// Add your new price ID
export const STRIPE_ENTERPRISE_MONTHLY_PRICE_ID =
  process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "";

// Then add it to the exported settings
const settings = {
  // ...existing settings
  stripe: {
    // ...existing stripe settings
    enterpriseMonthlyPriceId: STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
  },
};
```

#### 2. Update Your Pricing Page

Modify your pricing page component to include the new plan:

```tsx
// In src/app/(public)/pricing/page.tsx or your pricing component

// Add your new plan to the pricing options
const pricingPlans = [
  // Existing plans...
  {
    name: "Enterprise",
    price: "$49",
    interval: "/month",
    features: [
      "Unlimited notes",
      "Real-time collaboration",
      "Priority support",
      "Custom integrations",
      "Dedicated account manager",
    ],
    priceId: settings.stripe.enterpriseMonthlyPriceId,
    highlighted: false,
  },
];
```

#### 3. Update Subscription Logic

If your application has specific features or permissions tied to subscription levels, update your permission logic:

```typescript
// In your permissions/features logic file

export function hasAccess(user, feature) {
  // Add your new subscription type
  if (feature === "priority-support") {
    return (
      user.subscriptionStatus === "active" &&
      (user.subscriptionType === "pro" ||
        user.subscriptionType === "enterprise")
    );
  }

  // Enterprise-only features
  if (feature === "dedicated-account-manager") {
    return (
      user.subscriptionStatus === "active" &&
      user.subscriptionType === "enterprise"
    );
  }

  // Existing permission checks...
}
```

### Step 3: Test Your New Product

1. Start your application
2. Navigate to the pricing page
3. Verify your new plan appears correctly
4. Test the subscription flow by subscribing to your new plan
5. Confirm that the appropriate features/permissions are granted

### Step 4: Update Webhook Handling (If Needed)

If your new product requires special handling in webhooks, update your webhook handler:

```typescript
// In your webhook handler

async function handleSubscriptionCreated(subscription) {
  // Get the price ID from the subscription
  const priceId = subscription.items.data[0].price.id;

  // Determine the subscription type based on price ID
  let subscriptionType = "free";
  if (priceId === settings.stripe.proPriceId) {
    subscriptionType = "pro";
  } else if (
    priceId === settings.stripe.enterpriseMonthlyPriceId ||
    priceId === settings.stripe.enterpriseYearlyPriceId
  ) {
    subscriptionType = "enterprise";
  }

  // Update the user record
  await db.user.update({
    where: { stripeCustomerId: subscription.customer },
    data: {
      subscriptionStatus: "active",
      subscriptionType,
      // Add any enterprise-specific fields if needed
    },
  });
}
```

---

## Troubleshooting

**Script won't accept my key:**

- Make sure you're using the **Secret Key** (`sk_test_...`), not the Publishable Key (`pk_test_...`)
- Ensure your Stripe account is in **Test mode**

**Script errors out:**

- Check that your Stripe account has no existing products with the same names
- Verify your internet connection and try again
- The script will automatically clean up any partially created objects

**Environment variables not updated:**

- Check the console output for specific error messages
- Make sure you have write permissions in your project directory
- Re-run the script after fixing any issues

**Can't view products in Stripe Dashboard:**

- Make sure you're using a modern browser (Chrome, Firefox, Safari, or Edge)
- Verify you're in Test mode in the Stripe dashboard
- Check that the script completed successfully without errors

---

## FAQ

**Can I re-run the script?**  
Yes! The script is smart - it detects existing products and reuses them instead of creating duplicates.

**What if I want different products or pricing?**  
Edit `./setup/stripe-config.json` to customize the products, features, and pricing before running the script.

**Do I need to do anything in the Stripe dashboard?**  
Nope! The script handles everything automatically. You can log into your Stripe dashboard after running it to see what was created.

**What happens if the script fails?**  
The script automatically rolls back (deactivates) any Stripe objects it created during that run, so your account stays clean.

---

## Additional Resources

- [Stripe Dashboard](https://dashboard.stripe.com) - View your products and billing
- [Project README](../README.md) - Main project documentation
- [Stripe API Documentation](https://stripe.com/docs/keys) - Official Stripe docs

---

## How It Works (Technical Details)

The setup script (`./setup/stripe.mjs`):

- Reads configuration from `./setup/stripe-config.json`
- Uses the official Stripe Node.js SDK
- Creates products, prices, and entitlement features via Stripe's API
- Links features to products using Stripe's Entitlements API
- Configures a customer billing portal
- Writes all generated IDs to your `.env` file
- Includes rollback functionality if errors occur
