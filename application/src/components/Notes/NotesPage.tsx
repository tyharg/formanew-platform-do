'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import { Alert, Dialog, DialogContent } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Note, NotesApiClient } from 'lib/api/notes';
import NoteForm from './NotesForm/NoteForm';
import NotesGridView from './NotesGridView/NotesGridView';
import NotesListView from './NotesListView/NotesListView';
import NotesHeader from './NotesHeader/NotesHeader';
import PageContainer from '../Common/PageContainer/PageContainer';
import ConfirmationDialog from './ConfirmationDialog/ConfirmationDialog';
import Toast from '../Common/Toast/Toast';
import Pagination from '../Common/Pagination/Pagination';
import { useNotesSSE } from '../../hooks/useNotesSSE';
import { useCompanySelection } from 'context/CompanySelectionContext';

// Create an instance of the ApiClient
const apiClient = new NotesApiClient();

/**
 * NotesPage component
 * Displays a list of notes with options to view, edit, and create new notes.
 */
const NotesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>(
    'success'
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notes, setNotes] = useState<Note[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [recentlyUpdatedTitles, setRecentlyUpdatedTitles] = useState<Set<string>>(new Set());

  // Ref to track timeout IDs for cleanup
  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const { selectedCompanyId, selectedCompany, isLoading: isLoadingCompanies } =
    useCompanySelection();
  const router = useRouter();

  const companyDisplayName = selectedCompany
    ? selectedCompany.displayName ?? selectedCompany.legalName
    : null;
  const canManageNotes = Boolean(selectedCompanyId) && !isLoadingCompanies;

  // Fetch notes from API
  const fetchNotes = useCallback(async () => {
    if (!selectedCompanyId) {
      setNotes([]);
      setTotalNotes(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { notes, total } = await apiClient.getNotes({
        companyId: selectedCompanyId,
        page,
        pageSize,
        search: searchQuery,
        sortBy,
      });
      setNotes(notes);
      setTotalNotes(total);
      setError(null);
    } catch {
      setError('Failed to load notes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompanyId, page, pageSize, searchQuery, sortBy]);

  useEffect(() => {
    if (isLoadingCompanies) {
      return;
    }
    fetchNotes();
  }, [fetchNotes, isLoadingCompanies]);

  useEffect(() => {
    setPage(1);
  }, [selectedCompanyId]);

  // Handle real-time title updates via SSE
  const handleTitleUpdate = useCallback((noteId: string, newTitle: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId 
          ? { ...note, title: newTitle }
          : note
      )
    );
    
    // Add to recently updated tracking for visual indicator
    setRecentlyUpdatedTitles(prev => new Set(prev).add(noteId));

    // Clear any existing timeout for this noteId
    if (timeoutRef.current[noteId]) {
      clearTimeout(timeoutRef.current[noteId]);
    }

    // Remove from tracking after animation completes
    timeoutRef.current[noteId] = setTimeout(() => {
      setRecentlyUpdatedTitles(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
      delete timeoutRef.current[noteId];
    }, 3000); // 3 second animation duration
  }, []);

  // Initialize SSE connection for real-time updates
  useNotesSSE(handleTitleUpdate);

  // Cleanup animation tracking on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts when component unmounts
      Object.values(timeoutRef.current).forEach(clearTimeout);
      timeoutRef.current = {};
      setRecentlyUpdatedTitles(new Set());
    };
  }, []);

  const handleSortChange = (
    event: ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    child: React.ReactNode
  ) => {
    setSortBy(event.target.value as string);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCreateNote = async (noteData: { title?: string; content: string }) => {
    if (!selectedCompanyId) {
      setToastMessage('Select a company before creating notes.');
      setToastSeverity('info');
      setToastOpen(true);
      return;
    }

    try {
      await apiClient.createNote({ ...noteData, companyId: selectedCompanyId });
      setIsCreateModalOpen(false);

      // Navigate to page 1 to see the new note (newest first)
      if (page !== 1) {
        setPage(1);
        // fetchNotes() will be called automatically by useEffect when page changes
      } else {
        // Already on page 1, manually fetch to see the new note
        await fetchNotes();
      }

      // Show success toast
      setToastMessage('Note created successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note. Please try again.');
      // Show error toast
      setToastMessage('Failed to create note');
      setToastSeverity('error');
      setToastOpen(true);
    }
  };
  const handleDeleteConfirmation = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteConfirmationOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      try {
        await apiClient.deleteNote(noteToDelete);

        // Refetch current page to handle cases where:
        // 1. Page becomes empty and should show previous page
        // 2. Notes from next page should fill current page
        await fetchNotes();

        // Check if current page is now empty and we're not on page 1
        const newTotalPages = Math.ceil((totalNotes - 1) / pageSize);
        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }

        // Show success toast
        setToastMessage('Note deleted successfully');
        setToastSeverity('success');
        setToastOpen(true);
      } catch (err) {
        console.error('Error deleting note:', err);
        setError('Failed to delete note. Please try again.');
        // Show error toast
        setToastMessage('Failed to delete note');
        setToastSeverity('error');
        setToastOpen(true);
      } finally {
        setDeleteConfirmationOpen(false);
        setNoteToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setNoteToDelete(null);
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  // Legacy handler - now redirects to confirmation flow
  const handleDeleteNote = (noteId: string) => {
    handleDeleteConfirmation(noteId);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    // Don't fetch notes here - only refresh when actual updates are made
  };

  const navigateToNote = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}`);
  };

  const handleViewNote = (noteId: string) => {
    navigateToNote(noteId);
  };

  const handleEditNote = (noteId: string) => {
    navigateToNote(noteId);
  };

  return (
    <PageContainer title="Notes">
      {/* Header and Controls */}
      <NotesHeader
        searchQuery={searchQuery}
        sortBy={sortBy}
        viewMode={viewMode}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
        onCreateNote={() => {
          if (!canManageNotes) {
            setToastMessage('Select a company before creating notes.');
            setToastSeverity('info');
            setToastOpen(true);
            return;
          }
          setIsCreateModalOpen(true);
        }}
        canCreate={canManageNotes}
        companyName={companyDisplayName}
        isCompanyLoading={isLoadingCompanies}
      />

      {!isLoadingCompanies && !selectedCompanyId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Add a company to start capturing notes and documents in one place.
        </Alert>
      )}

      {/* Notes Display */}
      {viewMode === 'list' ? (
        <NotesListView
          notes={notes}
          isLoading={isLoading}
          error={error}
          onViewNote={handleViewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          recentlyUpdatedTitles={recentlyUpdatedTitles}
        />
      ) : (
        <NotesGridView
          notes={notes}
          isLoading={isLoading}
          error={error}
          onViewNote={handleViewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          recentlyUpdatedTitles={recentlyUpdatedTitles}
        />
      )}

      {/* Only show pagination controls when there are notes and not loading */}
      {!isLoading && totalNotes > 0 && (
        <Pagination
          totalItems={totalNotes}
          pageSize={pageSize}
          setPageSize={setPageSize}
          page={page}
          setPage={setPage}
        />
      )}

      {/* Create Note Modal */}
      <Dialog open={isCreateModalOpen} onClose={handleCloseCreateModal}>
        <DialogContent>
          <NoteForm mode="create" onSave={handleCreateNote} onCancel={handleCloseCreateModal} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmButtonColor="error"
      />

      {/* Toast notifications */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={handleCloseToast}
      />
    </PageContainer>
  );
};

export default NotesPage;
