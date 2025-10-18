'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { StoreProduct } from './ProductList';

interface ProductEditModalProps {
  open: boolean;
  product: StoreProduct;
  onClose: () => void;
  onSave: (
    productId: string,
    payload: { name: string; description: string; displayOnStorefront: boolean }
  ) => void;
  onArchive: (productId: string) => void;
  onUnarchive: (productId: string) => void;
  isUpdating: boolean;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  open,
  product,
  onClose,
  onSave,
  onArchive,
  onUnarchive,
  isUpdating,
}) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [displayOnStorefront, setDisplayOnStorefront] = useState(
    product.displayOnStorefront
  );

  useEffect(() => {
    if (open) {
      setName(product.name);
      setDescription(product.description);
      setDisplayOnStorefront(product.displayOnStorefront);
    }
  }, [open, product]);

  const handleSave = () => {
    onSave(product.id, { name, description, displayOnStorefront });
  };

  const handleArchive = () => {
    onArchive(product.id);
  };

  const handleUnarchive = () => {
    onUnarchive(product.id);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          {product.active && (
            <FormControlLabel
              control={
                <Switch
                  checked={displayOnStorefront}
                  onChange={(e) => setDisplayOnStorefront(e.target.checked)}
                />
              }
              label="Display on storefront"
            />
          )}
          <Box>
            <Typography variant="caption" display="block" color="text.secondary">
              Price cannot be changed after creation. To change the price, create a new product.
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {product.unitAmount !== null && product.currency
                ? `${(product.unitAmount / 100).toFixed(2)} ${product.currency.toUpperCase()}`
                : '—'}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {product.active ? (
          <Button onClick={handleArchive} color="error" disabled={isUpdating}>
            {isUpdating ? <CircularProgress size={22} /> : 'Archive'}
          </Button>
        ) : (
          <Button onClick={handleUnarchive} color="success" disabled={isUpdating}>
            {isUpdating ? <CircularProgress size={22} /> : 'Reactivate'}
          </Button>
        )}
        <Box sx={{ flex: '1 1 auto' }} />
        <Button onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isUpdating}>
          {isUpdating ? <CircularProgress size={22} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductEditModal;
