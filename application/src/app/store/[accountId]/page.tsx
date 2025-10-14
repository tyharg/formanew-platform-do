'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Button } from '@mui/material';

// Define the structure for product data retrieved from the API
interface ProductDisplay {
  id: string;
  name: string;
  description: string;
  priceId: string;
  unitAmount: number; // in cents
  currency: string;
}

// Application fee configuration (10% of the price, minimum $1.00)
const APPLICATION_FEE_PERCENTAGE = 0.10;
const MIN_APPLICATION_FEE_CENTS = 100; // $1.00

/**
 * Storefront page for a specific connected account.
 * NOTE: In a real application, you should use a more user-friendly identifier (like a slug)
 * instead of the raw Stripe Account ID in the URL.
 */
export default async function StorefrontPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId: stripeAccountId } = await params;
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    // Fetch products from the connected account
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // API call to retrieve products from the connected account via the platform backend
        const response = await fetch(`/api/store/${stripeAccountId}/products`);
        
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
  }, [stripeAccountId]);

  const handlePurchase = async (product: ProductDisplay) => {
    setIsCheckoutLoading(product.id);
    setError(null);

    try {
      // Calculate application fee: 10% of the price, minimum $1.00
      const calculatedFeeCents = Math.max(
        Math.round(product.unitAmount * APPLICATION_FEE_PERCENTAGE),
        MIN_APPLICATION_FEE_CENTS
      );
      // Convert fee back to string dollars for API payload consistency
      const applicationFeeAmount = (calculatedFeeCents / 100).toFixed(2); 

      // 1. Call backend to create a Checkout Session
      const response = await fetch(`/api/store/${stripeAccountId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: product.priceId,
          applicationFeeAmount: applicationFeeAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session.');
      }

      const { url } = data;

      // 2. Redirect to Stripe Hosted Checkout
      window.location.href = url;

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
        {/* Display the connected account ID for demo purposes */}
        Storefront: {stripeAccountId}
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
                  {/* NOTE: The application fee calculation here is client-side for display only. 
                      The actual fee calculation happens server-side in the checkout route. */}
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
