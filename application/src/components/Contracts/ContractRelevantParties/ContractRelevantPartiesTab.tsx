'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { RelevantPartiesApiClient, RelevantPartyRecord } from '@/lib/api/relevantParties';

interface ContractRelevantPartiesTabProps {
  contractId: string;
}

const relevantPartiesClient = new RelevantPartiesApiClient();

interface PartyFormState {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  notes: string;
}

const defaultFormState: PartyFormState = {
  fullName: '',
  email: '',
  phone: '',
  role: '',
  notes: '',
};

const ContractRelevantPartiesTab: React.FC<ContractRelevantPartiesTabProps> = ({ contractId }) => {
  const [parties, setParties] = useState<RelevantPartyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formState, setFormState] = useState<PartyFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activePartyId, setActivePartyId] = useState<string | null>(null);

  const loadParties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await relevantPartiesClient.list(contractId);
      setParties(response);
    } catch (err) {
      console.error('Failed to load relevant parties', err);
      setError('Unable to load relevant parties right now.');
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void loadParties();
  }, [loadParties]);

  const sortedParties = useMemo(
    () => parties.slice().sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [parties]
  );

  const resetForm = () => {
    setFormState(defaultFormState);
    setFormError(null);
    setActivePartyId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleOpenEdit = (party: RelevantPartyRecord) => {
    setFormState({
      fullName: party.fullName,
      email: party.email,
      phone: party.phone ?? '',
      role: party.role ?? '',
      notes: party.notes ?? '',
    });
    setDialogMode('edit');
    setDialogOpen(true);
    setActivePartyId(party.id);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleFormChange = (field: keyof PartyFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = async () => {
    const trimmedName = formState.fullName.trim();
    const trimmedEmail = formState.email.trim();

    if (!trimmedName) {
      setFormError('Full name is required.');
      return;
    }

    if (!trimmedEmail) {
      setFormError('Email is required.');
      return;
    }

    setFormError(null);
    setSaving(true);
    setActionError(null);
    setActionSuccess(null);

    const payload = {
      fullName: trimmedName,
      email: trimmedEmail,
      phone: formState.phone.trim() || null,
      role: formState.role.trim() || null,
      notes: formState.notes.trim() || null,
    };

    try {
      if (dialogMode === 'create') {
        await relevantPartiesClient.create(contractId, payload);
        setActionSuccess('Relevant party added.');
      } else if (activePartyId) {
        await relevantPartiesClient.update(contractId, activePartyId, payload);
        setActionSuccess('Relevant party updated.');
      }
      await loadParties();
      handleDialogClose();
    } catch (err) {
      console.error('Failed to save relevant party', err);
      setActionError(err instanceof Error ? err.message : 'Unable to save relevant party right now.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (party: RelevantPartyRecord) => {
    const confirmed = window.confirm(`Remove ${party.fullName}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      await relevantPartiesClient.delete(contractId, party.id);
      setActionSuccess('Relevant party removed.');
      await loadParties();
    } catch (err) {
      console.error('Failed to delete relevant party', err);
      setActionError(err instanceof Error ? err.message : 'Unable to delete relevant party right now.');
    }
  };

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Box pr={{ sm: 2 }}>
          <Typography variant="h6" gutterBottom>
            Invite clients and stakeholders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add the people who should receive this contract. Each party can later access a client portal with their
            magic link token.
          </Typography>
          {actionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {actionError}
            </Alert>
          )}
          {actionSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {actionSuccess}
            </Alert>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Add relevant party
        </Button>
      </Box>

      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Relevant parties</Typography>
          <Tooltip title="Refresh list">
            <span>
              <IconButton onClick={() => void loadParties()} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : sortedParties.length === 0 ? (
          <Alert severity="info">No relevant parties yet. Add at least one recipient to keep things moving.</Alert>
        ) : (
          <Stack spacing={2}>
            {sortedParties.map((party) => (
              <Stack key={party.id} direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {party.fullName}
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {party.email}
                    </Typography>
                    {party.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {party.phone}
                      </Typography>
                    )}
                    {party.role && (
                      <Chip label={party.role} size="small" color="primary" variant="outlined" />
                    )}
                  </Stack>
                  {party.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {party.notes}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                  <Tooltip title="Edit">
                    <span>
                      <IconButton size="small" onClick={() => handleOpenEdit(party)} aria-label={`Edit ${party.fullName}`}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(party)}
                        aria-label={`Delete ${party.fullName}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{dialogMode === 'create' ? 'Add relevant party' : 'Edit relevant party'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Full name" value={formState.fullName} onChange={handleFormChange('fullName')} required />
            <TextField label="Email" type="email" value={formState.email} onChange={handleFormChange('email')} required />
            <TextField label="Phone" value={formState.phone} onChange={handleFormChange('phone')} />
            <TextField label="Role" value={formState.role} onChange={handleFormChange('role')} />
            <TextField
              label="Notes"
              value={formState.notes}
              onChange={handleFormChange('notes')}
              multiline
              minRows={3}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ContractRelevantPartiesTab;
