import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { getCompanyById, addProductToCompany } from '@/lib/mockDb';

/**
 * API Route to create a Product and an associated Price on a Connected Account.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;
  const { name, description, price, currency } = await req.json();

  if (!name || !price || !currency) {
    return NextResponse.json({ message: 'Missing required fields: name, price, currency' }, { status: 400 });
  }

  try {
    // 1. Fetch company data
    const company = await getCompanyById(companyId);
    const stripeAccountId = company?.finance?.stripeAccountId;

    if (!stripeAccountId || !validateStripeAccountId(stripeAccountId)) {
      return NextResponse.json({ message: 'Stripe account not connected.' }, { status: 400 });
    }

    // Convert price from dollars/units to cents/smallest currency unit
    const priceInCents = Math.round(parseFloat(price) * 100);

    // --- Step 2: Create Product and Price on the Connected Account ---
    // We use the { stripeAccount: stripeAccountId } option to ensure the call
    // is made on behalf of the connected account.
    const productWithPrice = await stripe.products.create({
      name: name,
      description: description,
      // Create a default price simultaneously
      default_price_data: {
        unit_amount: priceInCents,
        currency: currency,
        recurring: undefined, // Ensure it's a one-time payment for simplicity
      },
    }, {
      stripeAccount: stripeAccountId, // IMPORTANT: Directs the API call to the connected account
    });

    // --- Step 3: Store the Product/Price IDs locally (for storefront lookup) ---
    const productId = productWithPrice.id;
    // default_price is automatically populated as a string (Price ID) when default_price_data is used
    const priceId = productWithPrice.default_price as string; 

    await addProductToCompany(companyId, productId, priceId);

    return NextResponse.json({ 
      message: 'Product created successfully on connected account.', 
      productId, 
      priceId 
    });

  } catch (error) {
    console.error('Stripe Product Creation Error:', error);
    return NextResponse.json(
      { message: 'Failed to create product on Stripe.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
