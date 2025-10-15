'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useCompanySelection } from '@/context/CompanySelectionContext';
import { CompanyFinance } from '@/types';
import ProductCreationForm from './ProductCreationForm';
import ProductList, { StoreProduct } from './ProductList';
import StripeConnectSetup from '@/components/AccountSettings/CompanyFinanceSettings/StripeConnectSetup';

interface FinanceResponse {
  finance: CompanyFinance | null;
}

const fetchJson = async <T,>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload.error === 'string' ? payload.error : response.statusText;
    throw new Error(message);
  }
  return (await response.json()) as T;
};

const mapProducts = (products: Array<Record<string, unknown>>): StoreProduct[] =>
  products
    .map((rawProduct) => {
      const id = typeof rawProduct.id === 'string' ? rawProduct.id : null;
      const defaultPriceId =
        typeof rawProduct.defaultPriceId === 'string' ? rawProduct.defaultPriceId : null;

      if (!id || !defaultPriceId) {
        return null;
      }

      const name = typeof rawProduct.name === 'string' ? rawProduct.name : 'Untitled product';
      const description =
        typeof rawProduct.description === 'string' ? rawProduct.description : '';
      const unitAmount =
        typeof rawProduct.unitAmount === 'number' ? rawProduct.unitAmount : null;
      const currency = typeof rawProduct.currency === 'string' ? rawProduct.currency : null;
      const active = typeof rawProduct.active === 'boolean' ? rawProduct.active : true;

      return {
        id,
        name,
        description,
        defaultPriceId,
        unitAmount,
        currency,
        active,
      } satisfies StoreProduct;
    })
    .filter((product): product is StoreProduct => Boolean(product));

export default function CompanyStoreManagement() {
  const { selectedCompanyId, isLoading: companiesLoading } = useCompanySelection();
  const [finance, setFinance] = useState<CompanyFinance | null>(null);
  const [isFinanceLoading, setIsFinanceLoading] = useState(true);
  const [financeError, setFinanceError] = useState<string | null>(null);

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'products' | 'settings'>('products');

  const isReadyForStore = useMemo(
    () => Boolean(finance?.stripeAccountId && finance?.chargesEnabled),
    [finance]
  );

  const storeUrl = useMemo(() => {
    if (!finance?.stripeAccountId) {
      return null;
    }
    return `/store/${finance.stripeAccountId}`;
  }, [finance?.stripeAccountId]);

  const fetchProducts = useCallback(
    async (companyId: string) => {
      setProductsError(null);
      setIsProductsLoading(true);
      try {
        const payload = await fetchJson<{ products: Array<Record<string, unknown>> }>(
          `/api/company/${companyId}/finance/stripe/products`
        );
        setProducts(mapProducts((payload.products ?? []) as Array<Record<string, unknown>>));
      } catch (error) {
        console.error('Failed to load store products', error);
        setProducts([]);
        setProductsError(error instanceof Error ? error.message : 'Unable to load store products.');
      } finally {
        setIsProductsLoading(false);
      }
    },
    []
  );

  const loadFinance = useCallback(async () => {
    if (!selectedCompanyId) {
      setFinance(null);
      setProducts([]);
      setIsFinanceLoading(false);
      return;
    }

    setIsFinanceLoading(true);
    setFinanceError(null);

    try {
      const payload = await fetchJson<FinanceResponse>(`/api/companies/${selectedCompanyId}/finance`, {
        cache: 'no-store',
      });
      const currentFinance = payload.finance ?? null;
      setFinance(currentFinance);

      if (currentFinance?.stripeAccountId && currentFinance.chargesEnabled) {
        await fetchProducts(selectedCompanyId);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to load company finance configuration', error);
      setFinance(null);
      setProducts([]);
      setFinanceError(
        error instanceof Error ? error.message : 'Unable to load store configuration for this company.'
      );
    } finally {
      setIsFinanceLoading(false);
    }
  }, [selectedCompanyId, fetchProducts]);

  useEffect(() => {
    if (!companiesLoading) {
      void loadFinance();
    }
  }, [companiesLoading, loadFinance]);

  const handleRefreshProducts = useCallback(async () => {
    if (!selectedCompanyId) {
      return;
    }
    await fetchProducts(selectedCompanyId);
  }, [fetchProducts, selectedCompanyId]);

  const handleProductCreated = useCallback(async () => {
    await handleRefreshProducts();
  }, [handleRefreshProducts]);

  useEffect(() => {
    if (!isFinanceLoading && !isReadyForStore) {
      setTab('settings');
    }
  }, [isFinanceLoading, isReadyForStore]);

  const handleTabChange = (_event: React.SyntheticEvent, value: string) => {
    if (value === 'products' || value === 'settings') {
      setTab(value);
    }
  };

  const handleToggleProductActive = useCallback(
    async (productId: string, nextActive: boolean) => {
      if (!selectedCompanyId) {
        return;
      }
      setUpdatingId(productId);
      setProductsError(null);
      try {
        await fetchJson<{ success: true }>(
          `/api/company/${selectedCompanyId}/finance/stripe/products/${productId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: nextActive }),
          }
        );
        await fetchProducts(selectedCompanyId);
      } catch (error) {
        console.error('Failed to update product status', error);
        setProductsError(error instanceof Error ? error.message : 'Unable to update product status.');
      } finally {
        setUpdatingId(null);
      }
    },
    [selectedCompanyId, fetchProducts]
  );

  const handleStripeRefresh = useCallback(() => {
    void loadFinance();
  }, [loadFinance]);

  if (companiesLoading || isFinanceLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedCompanyId) {
    return (
      <Alert severity="info">Select or create a company to manage store products.</Alert>
    );
  }

  if (financeError) {
    return (
      <Alert severity="error" sx={{ maxWidth: 600 }}>
        {financeError}
      </Alert>
    );
  }

  const renderProductsTab = () => {
    if (!isReadyForStore) {
      return (
        <Alert
          severity="info"
          sx={{ mt: 3 }}
          action={
            <Button variant="outlined" onClick={() => setTab('settings')}>
              Open Settings
            </Button>
          }
        >
          Finish Stripe Connect setup under Settings before adding products.
        </Alert>
      );
    }

    return (
      <Stack spacing={3} sx={{ mt: 3 }}>
        <ProductCreationForm
          companyId={selectedCompanyId}
          stripeAccountId={finance?.stripeAccountId as string}
          onProductCreated={handleProductCreated}
        />

        <Divider />

        <ProductList
          products={products}
          isLoading={isProductsLoading}
          error={productsError}
          onRefresh={handleRefreshProducts}
          onToggleActive={handleToggleProductActive}
          updatingId={updatingId}
        />
      </Stack>
    );
  };

  const renderSettingsTab = () => {
    if (!selectedCompanyId) {
      return null;
    }

    return (
      <Box sx={{ mt: 3 }}>
        <StripeConnectSetup
          finance={finance}
          companyId={selectedCompanyId}
          onRefresh={handleStripeRefresh}
        />
      </Box>
    );
  };

  return (
    <Stack spacing={3}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Storefront Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Products created here are pushed directly to your connected Stripe account. Your live storefront
          is available at{' '}
          {storeUrl ? (
            <Link href={storeUrl} target="_blank" rel="noopener noreferrer">
              {storeUrl}
            </Link>
          ) : (
            '—'
          )}
          .
        </Typography>

        {!isReadyForStore && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Complete Stripe onboarding in the Settings tab to enable your storefront.
          </Alert>
        )}
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab value="products" label="Products" />
          <Tab value="settings" label="Settings" />
        </Tabs>

        {tab === 'products' ? renderProductsTab() : renderSettingsTab()}
      </Paper>
    </Stack>
  );
}
