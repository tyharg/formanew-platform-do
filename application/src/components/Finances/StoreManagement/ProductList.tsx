'use client';

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  defaultPriceId: string;
  unitAmount: number | null;
  currency: string | null;
  active: boolean;
}

interface ProductListProps {
  products: StoreProduct[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => Promise<void> | void;
  onToggleActive: (productId: string, nextActive: boolean) => Promise<void> | void;
  updatingId: string | null;
}

const formatPrice = (unitAmount: number | null, currency: string | null) => {
  if (unitAmount === null || currency === null) {
    return '—';
  }
  return `${(unitAmount / 100).toFixed(2)} ${currency.toUpperCase()}`;
};

const ProductList: React.FC<ProductListProps> = ({
  products,
  isLoading,
  error,
  onRefresh,
  onToggleActive,
  updatingId,
}) => {
  const handleRefreshClick = () => {
    void onRefresh();
  };

  const handleToggleClick = (productId: string, nextActive: boolean) => {
    void onToggleActive(productId, nextActive);
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Store Products</Typography>
        <Button variant="outlined" onClick={handleRefreshClick} disabled={isLoading}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Alert severity="info">No products created yet. Start by adding your first product.</Alert>
      ) : (
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stripe IDs</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell width="20%">
                  <Typography variant="subtitle2">{product.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {product.description || '—'}
                  </Typography>
                </TableCell>
                <TableCell width="15%">{formatPrice(product.unitAmount, product.currency)}</TableCell>
                <TableCell width="20%">
                  <Typography variant="caption" display="block">
                    Product: {product.id}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Price: {product.defaultPriceId}
                  </Typography>
                </TableCell>
                <TableCell width="10%">
                  <Chip
                    size="small"
                    label={product.active ? 'Active' : 'Archived'}
                    color={product.active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right" width="15%">
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => handleToggleClick(product.id, !product.active)}
                    disabled={updatingId === product.id}
                  >
                    {updatingId === product.id
                      ? 'Updating…'
                      : product.active
                      ? 'Archive'
                      : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default ProductList;
