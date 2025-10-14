'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import Toast from 'components/Common/Toast/Toast';
import ConfirmationDialog from './ConfirmationDialog/ConfirmationDialog';
import NoteForm from './NotesForm/NoteForm';
import { Note, NotesApiClient } from 'lib/api/notes';
import { useCompanySelection } from 'context/CompanySelectionContext';

const notesClient = new NotesApiClient();

interface NoteDetailsPageProps {
  noteId: string;
}

const NoteDetailsPage: React.FC<NoteDetailsPageProps> = ({ noteId }) => {
  const router = useRouter();
  const { selectCompany } = useCompanySelection();

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const showToast = (message: string, severity: typeof toastSeverity = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = () => setToastOpen(false);

  useEffect(() => {
    const loadNote = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const noteData = await notesClient.getNote(noteId);
        setNote(noteData);
        if (noteData.companyId) {
          selectCompany(noteData.companyId);
        }
      } catch (err) {
        console.error('Failed to load note details', err);
        setError('We could not load this note. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [noteId, selectCompany]);

  const handleUpdateNote = async (payload: { id?: string; title?: string; content: string }) => {
    try {
      setIsSaving(true);
      await notesClient.updateNote(noteId, { title: payload.title, content: payload.content });
      showToast('Note updated.');

      setNote((current) =>
        current
          ? {
              ...current,
              title: payload.title ?? current.title,
              content: payload.content,
            }
          : current
      );
    } catch (err) {
      console.error('Failed to update note', err);
      showToast('Unable to save changes. Try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await notesClient.deleteNote(noteId);
      showToast('Note deleted.');
      router.push('/dashboard/notes');
    } catch (err) {
      console.error('Failed to delete note', err);
      showToast('Unable to delete note. Try again.', 'error');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/notes');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <PageContainer title="Note details">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => router.push('/dashboard/notes')}>
          Back to Notes
        </Button>
      </PageContainer>
    );
  }

  if (!note) {
    return (
      <PageContainer title="Note details">
        <Alert severity="warning" sx={{ mb: 3 }}>
          We couldn’t find that note.
        </Alert>
        <Button variant="contained" onClick={() => router.push('/dashboard/notes')}>
          Back to Notes
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={note.title || 'Note details'}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Created on {new Date(note.createdAt).toLocaleString()}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => router.push('/dashboard/notes')}>
              Back to Notes
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              Delete Note
            </Button>
          </Stack>
        </Stack>

        <NoteForm
          mode="edit"
          noteId={noteId}
          onSave={handleUpdateNote}
          onCancel={handleCancel}
          isSubmitting={isSaving}
        />
      </Stack>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        title="Delete note?"
        message="This note will be permanently removed. This action cannot be undone."
        confirmButtonText={isDeleting ? 'Deleting…' : 'Delete'}
        cancelButtonText="Cancel"
        confirmButtonColor="error"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      <Toast open={toastOpen} message={toastMessage} severity={toastSeverity} onClose={handleToastClose} />
    </PageContainer>
  );
};

export default NoteDetailsPage;
