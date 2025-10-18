'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Stack, TextField } from '@mui/material';

interface ProductCreationFormProps {
  companyId: string;
  stripeAccountId: string;
  onProductCreated?: () => Promise<void> | void;
}

/**
 * Form for the connected account owner to create products on their Stripe account.
 */
export default function ProductCreationForm({ companyId, stripeAccountId, onProductCreated }: ProductCreationFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError('Price must be a positive number.');
      setIsLoading(false);
      return;
    }

    try {
      // Call the backend API to create the product on the connected account
      const response = await fetch(`/api/company/${companyId}/finance/stripe/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          price,
          currency,
          amount: parseFloat(price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product.');
      }

      const parts = [`Product "${name}" created successfully!`, `Product ID: ${data.productId}.`];
      if (data.priceId) {
        parts.push(`Price ID: ${data.priceId}.`);
      }
      setSuccessMessage(parts.join(' '));
      setName('');
      setDescription('');
      setPrice('');

      if (onProductCreated) {
        await onProductCreated();
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during product creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Create a Product for your Store
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Products created here are added directly to your connected Stripe account ({stripeAccountId}).
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption">
              View your storefront: <a href={`/company/${companyId}/store`} target="_blank" rel="noopener noreferrer">
                {`/company/${companyId}/store`}
              </a>
            </Typography>
          </Box>
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Price (e.g., 19.99)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              type="number"
              inputProps={{ step: '0.01' }}
              fullWidth
            />
            <TextField
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
              sx={{ width: '150px' }}
              helperText="e.g., usd, eur"
            />
          </Stack>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={isLoading || !name || !price}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Creating...' : 'Create Product'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
