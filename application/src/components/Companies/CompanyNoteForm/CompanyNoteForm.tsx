'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { CreateCompanyNotePayload } from 'lib/api/companies';

interface CompanyNoteFormProps {
  companyId: string;
  onSubmit: (payload: CreateCompanyNotePayload) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type NoteFormState = {
  authorName: string;
  content: string;
};

const defaultState: NoteFormState = {
  authorName: '',
  content: '',
};

const CompanyNoteForm: React.FC<CompanyNoteFormProps> = ({
  companyId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [values, setValues] = useState<NoteFormState>(defaultState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(defaultState);
    setError(null);
  }, [companyId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.content.trim()) {
      setError('Note content is required');
      return;
    }

    await onSubmit({
      companyId,
      authorName: values.authorName.trim() || null,
      content: values.content.trim(),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Add Note
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Capture context, follow-ups, or action items for this company.
          </Typography>
        </Box>

        <TextField
          label="Author (optional)"
          value={values.authorName}
          onChange={(event) => setValues((prev) => ({ ...prev, authorName: event.target.value }))}
          fullWidth
        />

        <TextField
          label="Note"
          value={values.content}
          onChange={(event) => {
            setValues((prev) => ({ ...prev, content: event.target.value }));
            setError(null);
          }}
          fullWidth
          multiline
          minRows={4}
          error={Boolean(error)}
          helperText={error || ' '}
        />

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Save Note
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CompanyNoteForm;
