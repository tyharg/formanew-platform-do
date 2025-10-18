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
  FormControl,
  FormHelperText,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FilesApiClient, FileRecord } from '@/lib/api/files';
import {
  CreateWorkItemPayload,
  UpdateWorkItemPayload,
  WorkItemRecord,
  WorkItemsApiClient,
  WORK_ITEM_STATUS_OPTIONS,
} from '@/lib/api/workItems';

interface ContractWorkItemsTabProps {
  contractId: string;
}

const workItemsClient = new WorkItemsApiClient();
const filesClient = new FilesApiClient();

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  BLOCKED: 'Blocked',
  COMPLETED: 'Completed',
};

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'warning' | 'success' | 'error'> = {
  NOT_STARTED: 'default',
  IN_PROGRESS: 'primary',
  BLOCKED: 'warning',
  COMPLETED: 'success',
};

interface WorkItemFormState {
  title: string;
  description: string;
  status: WorkItemRecord['status'];
  dueDate: string;
  linkedFileId: string;
}

const defaultFormState: WorkItemFormState = {
  title: '',
  description: '',
  status: 'NOT_STARTED',
  dueDate: '',
  linkedFileId: '',
};

const ContractWorkItemsTab: React.FC<ContractWorkItemsTabProps> = ({ contractId }) => {
  const [workItems, setWorkItems] = useState<WorkItemRecord[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formState, setFormState] = useState<WorkItemFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [itemsResponse, filesResponse] = await Promise.all([
        workItemsClient.list(contractId),
        filesClient.list(contractId),
      ]);
      setWorkItems(itemsResponse);
      setFiles(filesResponse);
    } catch (err) {
      console.error('Failed to load work items', err);
      setError('Unable to load work items right now.');
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const sortedWorkItems = useMemo(() => {
    return workItems
      .slice()
      .sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position;
        }
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
        return aDue - bDue;
      });
  }, [workItems]);

  const fileMap = useMemo(() => {
    const map = new Map<string, FileRecord>();
    files.forEach((file) => {
      map.set(file.id, file);
    });
    return map;
  }, [files]);

  const resetForm = () => {
    setFormState(defaultFormState);
    setFormError(null);
    setActiveItemId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: WorkItemRecord) => {
    setFormState({
      title: item.title,
      description: item.description ?? '',
      status: item.status,
      dueDate: item.dueDate ? item.dueDate.substring(0, 10) : '',
      linkedFileId: item.linkedFileId ?? '',
    });
    setDialogMode('edit');
    setDialogOpen(true);
    setActiveItemId(item.id);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleFormChange = (field: keyof WorkItemFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> & { target: { value: string } }
  ) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setFormState((prev) => ({ ...prev, status: event.target.value as WorkItemRecord['status'] }));
  };

  const handleFileChange = (event: SelectChangeEvent) => {
    setFormState((prev) => ({ ...prev, linkedFileId: (event.target.value as string) || '' }));
  };

  const handleSave = async () => {
    const trimmedTitle = formState.title.trim();
    if (!trimmedTitle) {
      setFormError('Title is required.');
      return;
    }

    setFormError(null);
    setSaving(true);
    setActionError(null);
    setActionSuccess(null);

    const payload: CreateWorkItemPayload | UpdateWorkItemPayload = {
      title: trimmedTitle,
      description: formState.description.trim() || null,
      status: formState.status,
      dueDate: formState.dueDate ? new Date(formState.dueDate).toISOString() : null,
      linkedFileId: formState.linkedFileId ? formState.linkedFileId : null,
    };

    try {
      if (dialogMode === 'create') {
        await workItemsClient.create(contractId, payload as CreateWorkItemPayload);
        setActionSuccess('Work item created.');
      } else if (activeItemId) {
        await workItemsClient.update(contractId, activeItemId, payload);
        setActionSuccess('Work item updated.');
      }
      await loadData();
      handleDialogClose();
    } catch (err) {
      console.error('Failed to save work item', err);
      setActionError(err instanceof Error ? err.message : 'Unable to save work item right now.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: WorkItemRecord) => {
    const confirmed = window.confirm(`Delete work item "${item.title}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      await workItemsClient.delete(contractId, item.id);
      setActionSuccess('Work item deleted.');
      await loadData();
    } catch (err) {
      console.error('Failed to delete work item', err);
      setActionError(err instanceof Error ? err.message : 'Unable to delete work item right now.');
    }
  };

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Track progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create checkpoints to keep everyone aligned on the contract’s progress. Link files for quick reference.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Add work item
          </Button>
        </Stack>
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
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Work items</Typography>
            <Tooltip title="Refresh list">
              <span>
                <Button onClick={() => void loadData()} disabled={isLoading}>
                  Refresh
                </Button>
              </span>
            </Tooltip>
          </Stack>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={32} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : sortedWorkItems.length === 0 ? (
            <Alert severity="info">No work items yet—add your first checkpoint to get started.</Alert>
          ) : (
            <List sx={{ width: '100%' }}>
              {sortedWorkItems.map((item) => {
                const linkedFile = item.linkedFileId ? fileMap.get(item.linkedFileId) : null;
                const dueDateLabel = item.dueDate
                  ? new Date(item.dueDate).toLocaleDateString()
                  : null;
                const completionLabel = item.completedAt
                  ? new Date(item.completedAt).toLocaleDateString()
                  : null;

                return (
                  <ListItem key={item.id} divider alignItems="flex-start">
                    <Box sx={{ flexGrow: 1, pr: 2 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                        <Chip
                          label={STATUS_LABELS[item.status] ?? item.status}
                          color={STATUS_COLOR[item.status] ?? 'default'}
                          size="small"
                        />
                      </Stack>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
                        {dueDateLabel && (
                          <Typography variant="body2" color="text.secondary">
                            Due {dueDateLabel}
                          </Typography>
                        )}
                        {completionLabel && (
                          <Typography variant="body2" color="text.secondary">
                            Completed {completionLabel}
                          </Typography>
                        )}
                        {linkedFile && linkedFile.downloadUrl && (
                          <Typography variant="body2" color="text.secondary">
                            Linked file:{' '}
                            <Button
                              component="a"
                              href={linkedFile.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                            >
                              {linkedFile.name}
                            </Button>
                          </Typography>
                        )}
                      </Stack>
                      {item.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit">
                          <span>
                            <IconButton size="small" onClick={() => handleOpenEdit(item)} aria-label={`Edit ${item.title}`}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(item)}
                              aria-label={`Delete ${item.title}`}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Stack>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{dialogMode === 'create' ? 'Add work item' : 'Edit work item'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Title"
              value={formState.title}
              onChange={handleFormChange('title')}
              required
              autoFocus
            />
            <TextField
              label="Description"
              value={formState.description}
              onChange={handleFormChange('description')}
              multiline
              minRows={3}
            />
            <FormControl fullWidth>
              <InputLabel id="work-item-status-label">Status</InputLabel>
              <Select
                labelId="work-item-status-label"
                label="Status"
                value={formState.status}
                onChange={handleStatusChange}
              >
                {WORK_ITEM_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {STATUS_LABELS[status] ?? status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Due date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formState.dueDate}
              onChange={handleFormChange('dueDate')}
            />
            <FormControl fullWidth>
              <InputLabel id="linked-file-label">Linked file</InputLabel>
              <Select
                labelId="linked-file-label"
                label="Linked file"
                value={formState.linkedFileId}
                onChange={handleFileChange}
                displayEmpty
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {files.map((file) => (
                  <MenuItem key={file.id} value={file.id}>
                    {file.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select a supporting document to link with this step (optional)</FormHelperText>
            </FormControl>
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

export default ContractWorkItemsTab;
