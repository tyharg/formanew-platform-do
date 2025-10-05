import React, { ChangeEvent } from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Stack,
} from '@mui/material';
import { Add, Search, List, GridView } from '@mui/icons-material';

interface NotesHeaderProps {
  searchQuery: string;
  sortBy: string;
  viewMode: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSortChange: (
    event: ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } }),
    child: React.ReactNode
  ) => void;
  onViewModeChange: (mode: string) => void;
  onCreateNote: () => void;
}

/**
 * Header component for notes page with search, sort, view mode controls, and create button.
 * Provides filtering and layout controls for the notes interface.
 */
const NotesHeader: React.FC<NotesHeaderProps> = ({
  searchQuery,
  sortBy,
  viewMode,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onCreateNote,
}) => {
  return (
    <Box data-testid="notes-header">
      {/* Header */}
      <Stack direction="row" justifyContent="right" sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateNote}
          size="small"
          data-testid="notes-create-button"
        >
          Create Note
        </Button>
      </Stack>
      {/* Search and Filter Controls */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems="center">
        {' '}
        <TextField
          placeholder="Search notes..."
          value={searchQuery}
          onChange={onSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
          inputProps={{ 'data-testid': 'notes-search-input' }}
        />{' '}
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            value={sortBy}
            onChange={onSortChange}
            displayEmpty
            size="small"
            data-testid="notes-sort-select"
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>
        </FormControl>{' '}
        <Stack direction="row" spacing={1}>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            onClick={() => onViewModeChange('list')}
            size="small"
            data-testid="notes-list-view-button"
          >
            <List fontSize="small" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => onViewModeChange('grid')}
            size="small"
            data-testid="notes-grid-view-button"
          >
            <GridView fontSize="small" />
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default NotesHeader;
