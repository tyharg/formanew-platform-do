import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NoteForm from './NoteForm';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock NotesApiClient
jest.mock('lib/api/notes', () => {
  const mockNote = {
    id: '123',
    userId: 'user1',
    title: 'Test Note',
    content: 'Test Content',
    createdAt: '2025-06-01T12:00:00Z',
  };

  return {
    NotesApiClient: jest.fn().mockImplementation(() => ({
      getNote: jest.fn().mockResolvedValue(mockNote),
    })),
  };
});

describe('NoteForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create form correctly', () => {
    render(<NoteForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByTestId('note-form-title')).toHaveTextContent('Create New Note');
    expect(screen.getByTestId('note-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('note-content-input')).toBeInTheDocument();
    expect(screen.getByTestId('note-save-button')).toBeInTheDocument();
    expect(screen.getByTestId('note-cancel-button')).toBeInTheDocument();
  });

  it('loads note data in view mode', async () => {
    render(<NoteForm mode="view" noteId="123" onCancel={mockOnCancel} />);

    // Should show loading initially
    expect(screen.getByTestId('note-loading-state')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('note-form-title')).toHaveTextContent('View Note');
    });

    // Fields should be populated and readonly
    expect(screen.getByTestId('note-form-title')).toHaveTextContent('View Note');

    // Check field values using getByDisplayValue which works with MUI components
    expect(screen.getByDisplayValue('Test Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument();

    // Only cancel button should be present in view mode
    expect(screen.getByTestId('note-cancel-button')).toBeInTheDocument();
    expect(screen.queryByTestId('note-save-button')).not.toBeInTheDocument();
  });

  it('loads note data in edit mode', async () => {
    render(<NoteForm mode="edit" noteId="123" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Edit Note')).toBeInTheDocument();
    });

    // Fields should be populated but editable
    expect(screen.getByTestId('note-form-title')).toHaveTextContent('Edit Note');

    // Check field values using getByDisplayValue which works with MUI components
    expect(screen.getByDisplayValue('Test Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument();

    // Both save and cancel buttons should be present
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
  it('calls onSave when form is submitted', async () => {
    render(<NoteForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Fill in the form by finding the input elements directly
    const titleInput = screen.getByTestId('note-title-input').querySelector('input');
    const contentInput = screen.getByTestId('note-content-input').querySelector('textarea');

    if (titleInput && contentInput) {
      fireEvent.change(titleInput, { target: { value: 'New Note' } });
      fireEvent.change(contentInput, { target: { value: 'New Content' } });
    }

    // Submit the form
    fireEvent.click(screen.getByTestId('note-save-button'));

    // Check if onSave was called with the right values
    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'New Note',
      content: 'New Content',
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<NoteForm mode="create" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByTestId('note-cancel-button'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
