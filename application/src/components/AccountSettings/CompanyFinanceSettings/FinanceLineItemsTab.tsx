'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { financeLineItemsClient, FinanceLineItem } from '@/lib/api/companyFinanceLineItems';

interface Props {
  companyId: string;
  currencyHint?: string | null;
}

const defaultForm = {
  type: 'INFLOW' as 'INFLOW' | 'OUTFLOW',
  amount: '',
  currency: 'usd',
  occurredAt: new Date().toISOString().slice(0, 10),
  description: '',
  category: '',
  notes: '',
};

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'usd').toUpperCase(),
  }).format(amount);

export default function FinanceLineItemsTab({ companyId, currencyHint }: Props) {
  const [items, setItems] = useState<FinanceLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await financeLineItemsClient.list(companyId);
      setItems(response.items);
    } catch (err) {
      console.error('Failed to load finance line items', err);
      setError(err instanceof Error ? err.message : 'Unable to load finance line items.');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (currencyHint) {
      setForm((prev) => ({ ...prev, currency: prev.currency || currencyHint }));
    }
  }, [currencyHint]);

  const handleChange = (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const amountNumber = Number(form.amount);
      if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        throw new Error('Enter a positive amount.');
      }

      await financeLineItemsClient.create(companyId, {
        type: form.type,
        amount: amountNumber,
        currency: form.currency || currencyHint || 'usd',
        occurredAt: new Date(form.occurredAt).toISOString(),
        description: form.description || undefined,
        category: form.category || undefined,
        notes: form.notes || undefined,
      });

      setForm({ ...defaultForm, currency: form.currency || currencyHint || 'usd' });
      await loadItems();
    } catch (err) {
      console.error('Failed to create finance line item', err);
      setError(err instanceof Error ? err.message : 'Unable to create finance line item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Remove this entry?')) {
      return;
    }
    try {
      await financeLineItemsClient.delete(companyId, itemId);
      await loadItems();
    } catch (err) {
      console.error('Failed to delete finance line item', err);
      setError(err instanceof Error ? err.message : 'Unable to delete finance line item.');
    }
  };


  return (
    <Stack spacing={3}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))' }, alignItems: 'flex-start' }}>
        <TextField
          select
          label="Type"
          value={form.type}
          onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as 'INFLOW' | 'OUTFLOW' }))}
          fullWidth
        >
          <MenuItem value="INFLOW">Money in</MenuItem>
          <MenuItem value="OUTFLOW">Money out</MenuItem>
        </TextField>
        <TextField
          label="Amount"
          type="number"
          inputProps={{ step: '0.01', min: '0' }}
          value={form.amount}
          onChange={handleChange('amount')}
          required
          fullWidth
        />
        <TextField
          label="Currency"
          value={form.currency}
          onChange={handleChange('currency')}
          helperText="ISO currency code (e.g., usd)"
          fullWidth
        />
        <TextField
          label="Date"
          type="date"
          value={form.occurredAt}
          onChange={handleChange('occurredAt')}
          required
          fullWidth
        />
        <TextField label="Description" value={form.description} onChange={handleChange('description')} fullWidth />
        <TextField label="Category" value={form.category} onChange={handleChange('category')} fullWidth />
        <TextField
          label="Notes"
          value={form.notes}
          onChange={handleChange('notes')}
          fullWidth
          multiline
          minRows={2}
          sx={{ gridColumn: { sm: 'span 2' } }}
        />
        <Box sx={{ gridColumn: { sm: 'span 2' } }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Add entry'}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={32} />
        </Box>
      ) : items.length === 0 ? (
        <Alert severity="info">No entries yet. Use the form above to record cash movements.</Alert>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.occurredAt).toLocaleDateString()}</TableCell>
                <TableCell>{item.type === 'INFLOW' ? 'Inflow' : 'Outflow'}</TableCell>
                <TableCell align="right">{formatAmount(item.amount, item.currency || 'usd')}</TableCell>
                <TableCell>{item.description || '—'}</TableCell>
                <TableCell>{item.category || '—'}</TableCell>
                <TableCell>{item.notes || '—'}</TableCell>
                <TableCell align="right">
                  <Button variant="text" color="error" size="small" onClick={() => handleDelete(item.id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}
