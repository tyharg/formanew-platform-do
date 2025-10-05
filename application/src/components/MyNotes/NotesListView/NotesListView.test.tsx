import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotesListView from './NotesListView';

const mockNotes = [
  {
    id: '1',
    userId: 'user1',
    title: 'Test Note 1',
    content: 'Content for test note 1',
    createdAt: '2025-06-01T12:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Test Note 2',
    content: 'Content for test note 2',
    createdAt: '2025-06-02T12:00:00Z',
  },
];

const mockHandlers = {
  onViewNote: jest.fn(),
  onEditNote: jest.fn(),
  onDeleteNote: jest.fn(),
};

describe('NotesListView', () => {
  it('renders loading state correctly', () => {
    render(
      <NotesListView
        notes={[]}
        isLoading={true}
        error={null}
        onViewNote={mockHandlers.onViewNote}
        onEditNote={mockHandlers.onEditNote}
        onDeleteNote={mockHandlers.onDeleteNote}
      />
    );

    expect(screen.getByTestId('notes-list-loading')).toBeInTheDocument();
  });

  it('renders error message when there is an error', () => {
    const errorMessage = 'Failed to load notes';
    render(
      <NotesListView
        notes={[]}
        isLoading={false}
        error={errorMessage}
        onViewNote={mockHandlers.onViewNote}
        onEditNote={mockHandlers.onEditNote}
        onDeleteNote={mockHandlers.onDeleteNote}
      />
    );

    expect(screen.getByTestId('notes-list-error')).toBeInTheDocument();
    expect(screen.getByTestId('notes-list-error-message')).toHaveTextContent(errorMessage);
  });

  it('renders empty state message when there are no notes', () => {
    render(
      <NotesListView
        notes={[]}
        isLoading={false}
        error={null}
        onViewNote={mockHandlers.onViewNote}
        onEditNote={mockHandlers.onEditNote}
        onDeleteNote={mockHandlers.onDeleteNote}
      />
    );

    expect(screen.getByTestId('notes-list-empty')).toBeInTheDocument();
  });

  it('renders notes in a table', () => {
    render(
      <NotesListView
        notes={mockNotes}
        isLoading={false}
        error={null}
        onViewNote={mockHandlers.onViewNote}
        onEditNote={mockHandlers.onEditNote}
        onDeleteNote={mockHandlers.onDeleteNote}
      />
    );

    expect(screen.getByTestId('notes-list-container')).toBeInTheDocument();
    expect(screen.getByTestId('notes-table')).toBeInTheDocument();
    expect(screen.getByTestId('note-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('note-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('note-title-1')).toHaveTextContent('Test Note 1');
    expect(screen.getByTestId('note-title-2')).toHaveTextContent('Test Note 2');
    expect(screen.getByTestId('note-content-1')).toHaveTextContent('Content for test note 1');
    expect(screen.getByTestId('note-content-2')).toHaveTextContent('Content for test note 2');
  });

  it('calls onViewNote when view button is clicked', () => {
    render(
      <NotesListView
        notes={mockNotes}
        isLoading={false}
        error={null}
        onViewNote={mockHandlers.onViewNote}
        onEditNote={mockHandlers.onEditNote}
        onDeleteNote={mockHandlers.onDeleteNote}
      />
    );

    const viewButton = screen.getByTestId('note-view-button-1');
    fireEvent.click(viewButton);

    expect(mockHandlers.onViewNote).toHaveBeenCalledWith('1');
  });

  it('calls onEditNote when edit button is clicked', () => {
    render(
      <NotesListView
        notes={mockNotes}
        isLoading={false}
        error={null}
        onViewNote={mockHandlers.onViewNote}
        onEditNote={mockHandlers.onEditNote}
        onDeleteNote={mockHandlers.onDeleteNote}
      />
    );

    const editButton = screen.getByTestId('note-edit-button-1');
    fireEvent.click(editButton);

    expect(mockHandlers.onEditNote).toHaveBeenCalledWith('1');
  });

  it('calls onDeleteNote when delete button is clicked', () => {
    render(
      <NotesListView
        notes={mockNotes}
        isLoading={false}
        error={null}
        onViewNote={mockHandlers.onViewNote}
        onEditNote={mockHandlers.onEditNote}
        onDeleteNote={mockHandlers.onDeleteNote}
      />
    );

    const deleteButton = screen.getByTestId('note-delete-button-1');
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDeleteNote).toHaveBeenCalledWith('1');
  });
});
