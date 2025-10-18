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
import ProductEditModal from './ProductEditModal';

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

const mapProducts = (products: Array<Record<string, unknown>>): StoreProduct[] => {
  const mapped: StoreProduct[] = [];

  products.forEach((rawProduct) => {
    const id = typeof rawProduct.id === 'string' ? rawProduct.id : null;
    const price =
      rawProduct && typeof rawProduct === 'object' && 'price' in rawProduct
        ? (rawProduct.price as Record<string, unknown> | null)
        : null;

    if (!id || !price || typeof price !== 'object') {
      return;
    }

    const priceId = typeof price.id === 'string' ? price.id : null;
    const amount = typeof price.amount === 'number' ? price.amount : null;
    const currency = typeof price.currency === 'string' ? price.currency : null;

    if (!priceId) {
      return;
    }

    const name = typeof rawProduct.name === 'string' ? rawProduct.name : 'Untitled product';
    const description =
      typeof rawProduct.description === 'string' ? rawProduct.description : '';
    const active = typeof rawProduct.active === 'boolean' ? rawProduct.active : true;
    const metadata =
      typeof rawProduct.metadata === 'object' && rawProduct.metadata !== null
        ? (rawProduct.metadata as { displayOnStorefront?: 'true' | 'false' })
        : undefined;
    const displayOnStorefront = metadata?.displayOnStorefront === 'true';

    mapped.push({
      id,
      name,
      description,
      defaultPriceId: priceId,
      unitAmount: amount,
      currency,
      active,
      displayOnStorefront,
    });
  });

  return mapped;
};

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
  const [productTab, setProductTab] = useState<'active' | 'archived'>('active');

  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { activeProducts, archivedProducts } = useMemo(() => {
    const active: StoreProduct[] = [];
    const archived: StoreProduct[] = [];
    products.forEach((p) => (p.active ? active.push(p) : archived.push(p)));
    return { activeProducts: active, archivedProducts: archived };
  }, [products]);

  const isReadyForStore = useMemo(
    () => Boolean(finance?.stripeAccountId && finance?.chargesEnabled),
    [finance]
  );

  const storeUrl = useMemo(() => {
    if (!selectedCompanyId || !finance?.chargesEnabled) {
      return null;
    }
    return `/company/${selectedCompanyId}/store`;
  }, [finance?.chargesEnabled, selectedCompanyId]);

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

  const handleProductTabChange = (_event: React.SyntheticEvent, value: string) => {
    if (value === 'active' || value === 'archived') {
      setProductTab(value);
    }
  };

  const handleProductClick = (product: StoreProduct) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsEditModalOpen(false);
  };

  const handleSaveProduct = async (
    productId: string,
    payload: { name: string; description: string; displayOnStorefront: boolean }
  ) => {
    if (!selectedCompanyId) return;
    setUpdatingId(productId);
    try {
      await fetchJson(`/api/company/${selectedCompanyId}/finance/stripe/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await fetchProducts(selectedCompanyId);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save product', error);
      // You might want to show a toast here
    } finally {
      setUpdatingId(null);
    }
  };

  const handleArchiveProduct = async (productId: string) => {
    if (!selectedCompanyId) return;
    setUpdatingId(productId);
    try {
      await fetchJson(`/api/company/${selectedCompanyId}/finance/stripe/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });
      await fetchProducts(selectedCompanyId);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to archive product', error);
      // You might want to show a toast here
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUnarchiveProduct = async (productId: string) => {
    if (!selectedCompanyId) return;
    setUpdatingId(productId);
    try {
      await fetchJson(`/api/company/${selectedCompanyId}/finance/stripe/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true }),
      });
      await fetchProducts(selectedCompanyId);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to unarchive product', error);
      // You might want to show a toast here
    } finally {
      setUpdatingId(null);
    }
  };
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

        <Tabs value={productTab} onChange={handleProductTabChange}>
          <Tab value="active" label={`Active (${activeProducts.length})`} />
          <Tab value="archived" label={`Archived (${archivedProducts.length})`} />
        </Tabs>

        <ProductList
          products={productTab === 'active' ? activeProducts : archivedProducts}
          isLoading={isProductsLoading}
          error={productsError}
          onRefresh={handleRefreshProducts}
          onProductClick={handleProductClick}
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

      {selectedProduct && (
        <ProductEditModal
          open={isEditModalOpen}
          product={selectedProduct}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          onArchive={handleArchiveProduct}
          onUnarchive={handleUnarchiveProduct}
          isUpdating={Boolean(updatingId)}
        />
      )}
    </Stack>
  );
}
