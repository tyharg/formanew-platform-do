'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Button } from '@mui/material';

interface ProductDisplay {
  id: string;
  name: string;
  description: string;
  priceId: string;
  unitAmount: number;
  currency: string;
}

const APPLICATION_FEE_PERCENTAGE = 0.1;
const MIN_APPLICATION_FEE_CENTS = 100;

interface StorefrontPageClientProps {
  accountId: string;
}

export default function StorefrontPageClient({ accountId }: StorefrontPageClientProps) {
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/store/${accountId}/products`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch products.');
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Could not load products.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [accountId]);

  const handlePurchase = async (product: ProductDisplay) => {
    setIsCheckoutLoading(product.id);
    setError(null);

    try {
      const calculatedFeeCents = Math.max(
        Math.round(product.unitAmount * APPLICATION_FEE_PERCENTAGE),
        MIN_APPLICATION_FEE_CENTS
      );
      const applicationFeeAmount = (calculatedFeeCents / 100).toFixed(2);

      const response = await fetch(`/api/store/${accountId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: product.priceId,
          applicationFeeAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session.');
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

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Storefront: {accountId}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to our store! All payments are processed securely via Stripe Connect.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {products.length === 0 ? (
        <Alert severity="info">
          No products available yet. The account owner needs to create some products in their Finance settings.
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
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
                  Platform Fee: {(Math.max(Math.round(product.unitAmount * APPLICATION_FEE_PERCENTAGE), MIN_APPLICATION_FEE_CENTS) / 100).toFixed(2)} {product.currency.toUpperCase()} (10% min $1.00)
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
