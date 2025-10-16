'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Contract, ContractsApiClient, UpdateContractPayload } from 'lib/api/contracts';
import { useToast } from 'context/ToastContext';

const contractsClient = new ContractsApiClient();

interface StripeProduct {
  id: string;
  name: string;
  price: {
    id: string;
    amount: number;
    currency: string;
  } | null;
}

interface ContractBillingTabProps {
  contract: Contract;
  onUpdate: (updatedContract: Contract) => void;
}

const ContractBillingTab: React.FC<ContractBillingTabProps> = ({ contract, onUpdate }) => {
  const { showToast } = useToast();
  const [isBillingEnabled, setIsBillingEnabled] = useState(contract.isBillingEnabled);
  const [stripePriceId, setStripePriceId] = useState(contract.stripePriceId ?? '');
  const [billingAmount, setBillingAmount] = useState<number | string>(
    contract.billingAmount ? contract.billingAmount / 100 : ''
  );
  const [billingCurrency, setBillingCurrency] = useState(contract.billingCurrency ?? 'USD');
  const [billingType, setBillingType] = useState<'product' | 'custom'>(
    contract.stripePriceId ? 'product' : 'custom'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isBillingEnabled || billingType !== 'product') return;
      setIsLoadingProducts(true);
      setProductError(null);
      try {
        const response = await fetch(`/api/company/${contract.companyId}/finance/stripe/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch Stripe products');
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Failed to fetch Stripe products', error);
        setProductError('Could not load products from Stripe. Please ensure your Stripe account is connected.');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [isBillingEnabled, billingType, contract.companyId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload: UpdateContractPayload = {
      isBillingEnabled,
    };

    if (billingType === 'product') {
      payload.stripePriceId = stripePriceId.trim() === '' ? null : stripePriceId.trim();
      payload.billingAmount = null;
      payload.billingCurrency = null;
    } else {
      payload.stripePriceId = null;
      const amountInCents = Math.round(Number(billingAmount) * 100);
      payload.billingAmount = amountInCents > 0 ? amountInCents : null;
      payload.billingCurrency = billingCurrency.trim() === '' ? null : billingCurrency.trim();
    }

    try {
      const updatedContract = await contractsClient.updateContract(contract.id, payload);
      onUpdate(updatedContract);
      showToast('Billing settings saved.', 'success');
    } catch (error) {
      console.error('Failed to save billing settings', error);
      showToast('Failed to save billing settings. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography variant="h6">Billing Settings</Typography>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isBillingEnabled}
                    onChange={(e) => setIsBillingEnabled(e.target.checked)}
                    name="isBillingEnabled"
                  />
                }
                label="Enable billing for this contract"
              />
              <Typography variant="body2" color="text.secondary">
                When enabled, a payment button will appear on the client portal for this contract.
              </Typography>
            </Box>

            {isBillingEnabled && (
              <Stack spacing={2}>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    name="billingType"
                    value={billingType}
                    onChange={(e) => setBillingType(e.target.value as 'product' | 'custom')}
                  >
                    <FormControlLabel value="product" control={<Radio />} label="Select a Product" />
                    <FormControlLabel value="custom" control={<Radio />} label="Custom Amount" />
                  </RadioGroup>
                </FormControl>

                {billingType === 'product' && (
                  <Box>
                    {isLoadingProducts ? (
                      <CircularProgress />
                    ) : productError ? (
                      <Typography color="error">{productError}</Typography>
                    ) : (
                      <FormControl fullWidth>
                        <InputLabel id="stripe-product-select-label">Stripe Product</InputLabel>
                        <Select
                          labelId="stripe-product-select-label"
                          value={stripePriceId}
                          onChange={(e) => setStripePriceId(e.target.value)}
                          label="Stripe Product"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {products.map((product) =>
                            product.price ? (
                              <MenuItem key={product.id} value={product.price.id}>
                                {product.name} -{' '}
                                {new Intl.NumberFormat(undefined, {
                                  style: 'currency',
                                  currency: product.price.currency,
                                }).format(product.price.amount / 100)}
                              </MenuItem>
                            ) : null
                          )}
                        </Select>
                        <FormHelperText>
                          Select a product from your Stripe account to associate with this contract.
                        </FormHelperText>
                      </FormControl>
                    )}
                  </Box>
                )}

                {billingType === 'custom' && (
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Amount"
                      type="number"
                      value={billingAmount}
                      onChange={(e) => setBillingAmount(e.target.value)}
                      fullWidth
                      inputProps={{ min: 0, step: '0.01' }}
                    />
                    <TextField
                      label="Currency"
                      value={billingCurrency}
                      onChange={(e) => setBillingCurrency(e.target.value.toUpperCase())}
                      fullWidth
                      inputProps={{ maxLength: 3 }}
                    />
                  </Stack>
                )}
              </Stack>
            )}

            <Box display="flex" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Save Billing Settings'}
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContractBillingTab;
