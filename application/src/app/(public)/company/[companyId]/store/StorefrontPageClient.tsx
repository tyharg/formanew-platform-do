'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';

interface ProductDisplay {
  id: string;
  name: string;
  description: string;
  priceId: string;
  unitAmount: number;
  currency: string;
}

interface StorefrontResponse {
  company: { id: string; name: string; description: string | null };
  storefront: { stripeAccountId: string | null; chargesEnabled: boolean };
}

const APPLICATION_FEE_PERCENTAGE = 0.1;
const MIN_APPLICATION_FEE_CENTS = 100;

interface StorefrontPageClientProps {
  companyId: string;
}

export default function StorefrontPageClient({ companyId }: StorefrontPageClientProps) {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);
  const [storefrontInfo, setStorefrontInfo] = useState<StorefrontResponse | null>(null);

  const stripeAccountId = storefrontInfo?.storefront.stripeAccountId ?? null;

  useEffect(() => {
    const loadStorefront = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const response = await fetch(`/api/public/company/${companyId}/storefront`, { cache: 'no-store' });
        const data = (await response.json()) as Partial<StorefrontResponse> & { error?: string };
        if (!response.ok || !data || !data.storefront || !data.company) {
          throw new Error(data?.error || 'Unable to load storefront.');
        }
        setStorefrontInfo(data as StorefrontResponse);

        if (!data.storefront.stripeAccountId || !data.storefront.chargesEnabled) {
          setProducts([]);
          return;
        }

        const productsResponse = await fetch(`/api/store/${data.storefront.stripeAccountId}/products`);
        const productData = await productsResponse.json().catch(() => ({ products: [] }));
        if (!productsResponse.ok) {
          throw new Error(productData?.error || 'Unable to load products for this storefront.');
        }
        setProducts(productData.products ?? []);
      } catch (err) {
        console.error(err);
        setStorefrontInfo(null);
        setProducts([]);
        setError(err instanceof Error ? err.message : 'Unable to load storefront.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStorefront();
  }, [companyId]);

  const handlePurchase = async (product: ProductDisplay) => {
    if (!stripeAccountId) {
      return;
    }

    setIsCheckoutLoading(product.id);
    setError(null);

    try {
      const calculatedFeeCents = Math.max(
        Math.round(product.unitAmount * APPLICATION_FEE_PERCENTAGE),
        MIN_APPLICATION_FEE_CENTS,
      );
      const applicationFeeAmount = (calculatedFeeCents / 100).toFixed(2);

      const response = await fetch(`/api/store/${stripeAccountId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: product.priceId,
          applicationFeeAmount,
          companyId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session.');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during checkout.');
      setIsCheckoutLoading(null);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!storefrontInfo) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error || 'Storefront is not available.'}</Alert>
      </Box>
    );
  }

  if (!stripeAccountId || !storefrontInfo.storefront.chargesEnabled) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', p: 3 }}>
        <Alert severity="info">
          This company&apos;s storefront is not live yet. Check back soon for offers from {storefrontInfo.company.name}.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {storefrontInfo.company.name} Storefront
      </Typography>
      {storefrontInfo.company.description ? (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {storefrontInfo.company.description}
        </Typography>
      ) : null}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {products.length === 0 ? (
        <Alert severity="info">
          No products available yet. The team at {storefrontInfo.company.name} is preparing their offerings.
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
          {products.map((product) => (
            <Card key={product.id} variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  {product.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {product.description}
                </Typography>
                <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                  {(product.unitAmount / 100).toFixed(2)} {product.currency.toUpperCase()}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handlePurchase(product)}
                  disabled={isCheckoutLoading === product.id}
                  startIcon={isCheckoutLoading === product.id ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isCheckoutLoading === product.id ? 'Redirecting...' : 'Buy Now'}
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                  Platform fee: {(Math.max(Math.round(product.unitAmount * APPLICATION_FEE_PERCENTAGE), MIN_APPLICATION_FEE_CENTS) / 100).toFixed(2)} {product.currency.toUpperCase()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
