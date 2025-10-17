import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'lib/auth/withAuth';
import { createDatabaseService } from 'services/database/databaseFactory';
import { stripe } from 'lib/stripe';
import { HTTP_STATUS } from 'lib/api/http';
import type Stripe from 'stripe';

export const GET = withAuth(
  async (
    _request: NextRequest,
    user: { id: string; role: string },
    paramsPromise: Promise<{ companyId: string }>
  ) => {
    try {
      const { companyId } = await paramsPromise;
      const db = await createDatabaseService();
      const company = await db.company.findById(companyId);

      if (!company || company.userId !== user.id) {
        return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
      }

      const finance = await db.companyFinance.findByCompanyId(companyId);
      if (!finance?.stripeAccountId) {
        return NextResponse.json(
          { error: 'Stripe account not connected' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }

      const products = await stripe.products.list(
        {
          expand: ['data.default_price'],
        },
        { stripeAccount: finance.stripeAccountId }
      );

      const productOptions = products.data.map((product) => {
        const defaultPrice = product.default_price;
        const expandedPrice: Stripe.Price | null =
          typeof defaultPrice === 'object' && defaultPrice
            ? defaultPrice
            : null;

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active,
          price: expandedPrice
            ? {
                id: expandedPrice.id,
                amount: expandedPrice.unit_amount,
                currency: expandedPrice.currency,
              }
            : null,
        };
      });

            return NextResponse.json({ products: productOptions });

          } catch (error) {

            console.error('Failed to fetch Stripe products', error);

            return NextResponse.json(

              { error: (error as Error).message || 'Internal server error' },

              { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }

            );

          }

        }

      );

      

      export const POST = withAuth(

        async (

          request: NextRequest,

          user: { id: string; role: string },

          paramsPromise: Promise<{ companyId: string }>

        ) => {

          try {

            const { companyId } = await paramsPromise;

            const db = await createDatabaseService();

            const company = await db.company.findById(companyId);

      

            if (!company || company.userId !== user.id) {

              return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });

            }

      

            const finance = await db.companyFinance.findByCompanyId(companyId);

            if (!finance?.stripeAccountId) {

              return NextResponse.json(

                { error: 'Stripe account not connected' },

                { status: HTTP_STATUS.BAD_REQUEST }

              );

            }

      

            const body = await request.json();

            const { name, description, price, currency } = body;

      

            if (!name || !price || !currency) {

              return NextResponse.json(

                { error: 'Missing required fields: name, price, currency' },

                { status: HTTP_STATUS.BAD_REQUEST }

              );

            }

      

            const product = await stripe.products.create(

              {

                name,

                description,

                default_price_data: {

                  currency,

                  unit_amount: Math.round(price * 100),

                },

              },

              {

                stripeAccount: finance.stripeAccountId,

              }

            );

      

            return NextResponse.json({ product });

          } catch (error) {

            console.error('Failed to create Stripe product', error);

            return NextResponse.json(

              { error: (error as Error).message || 'Internal server error' },

              { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }

            );

          }

        }

      );

      