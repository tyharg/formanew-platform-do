import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NotesHeader from './NotesHeader';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

const mockProps = {
  searchQuery: '',
  sortBy: 'newest',
  viewMode: 'list',
  onSearchChange: jest.fn(),
  onSortChange: jest.fn(),
  onViewModeChange: jest.fn(),
  onCreateNote: jest.fn(),
};

describe('NotesHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the create note button correctly', () => {
    render(
      <TestWrapper>
        <NotesHeader {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('notes-create-button')).toBeInTheDocument();
  });

  it('renders the create note button', () => {
    render(
      <TestWrapper>
        <NotesHeader {...mockProps} />
      </TestWrapper>
    );

    const createButton = screen.getByTestId('notes-create-button');
    expect(createButton).toBeInTheDocument();
  });

  it('calls onCreateNote when create button is clicked', () => {
    render(
      <TestWrapper>
        <NotesHeader {...mockProps} />
      </TestWrapper>
    );

    const createButton = screen.getByTestId('notes-create-button');
    fireEvent.click(createButton);

    expect(mockProps.onCreateNote).toHaveBeenCalledTimes(1);
  });

  it('renders search input with correct placeholder', () => {
    render(
      <TestWrapper>
        <NotesHeader {...mockProps} />
      </TestWrapper>
    );

    const searchInput = screen.getByTestId('notes-search-input');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    render(
      <TestWrapper>
        <NotesHeader {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('notes-list-view-button')).toBeInTheDocument();
    expect(screen.getByTestId('notes-grid-view-button')).toBeInTheDocument();
  });
});
