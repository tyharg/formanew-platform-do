import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { getCompanyProducts } from '@/lib/mockDb';
import Stripe from 'stripe';

/**
 * API Route to fetch products from a connected account for the storefront display.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { accountId: string } }
) {
  const stripeAccountId = params.accountId;

  if (!validateStripeAccountId(stripeAccountId)) {
    return NextResponse.json({ message: 'Invalid Stripe Account ID.' }, { status: 400 });
  }

  try {
    // 1. Retrieve local product IDs associated with this company (mock DB lookup)
    // We use the accountId here as a proxy for companyId in the mock DB lookup
    const localProducts = await getCompanyProducts('comp_12345'); // Using MOCK_COMPANY_ID for demo consistency

    if (localProducts.length === 0) {
        return NextResponse.json({ products: [] });
    }

    // 2. Fetch product details from Stripe using the Stripe-Account header
    const stripeProducts: Stripe.Product[] = [];
    
    // Fetching products one by one based on local IDs
    for (const { productId } of localProducts) {
        try {
            // Use the stripeAccount option to retrieve the product from the connected account
            const product = await stripe.products.retrieve(
                productId, 
                { expand: ['default_price'] }, // ProductRetrieveParams (second argument)
                { stripeAccount: stripeAccountId } // RequestOptions (third argument)
            );
            stripeProducts.push(product);
        } catch (e) {
            console.warn(`Product ${productId} not found on Stripe account ${stripeAccountId}. Skipping.`);
        }
    }

    // 3. Format data for the frontend
    const productsDisplay = stripeProducts
        .filter(p => p.default_price && p.active)
        .map(p => {
            const price = p.default_price as Stripe.Price;
            return {
                id: p.id,
                name: p.name,
                description: p.description || 'No description provided.',
                priceId: price.id,
                unitAmount: price.unit_amount || 0,
                currency: price.currency,
            };
        });

    return NextResponse.json({ products: productsDisplay });

  } catch (error) {
    console.error('Stripe Product Fetch Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products from Stripe.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
