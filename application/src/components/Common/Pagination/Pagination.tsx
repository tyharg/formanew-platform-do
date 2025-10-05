import React from 'react';
import { Box, Pagination, TextField, MenuItem } from '@mui/material';

interface PaginationProps {
  totalItems: number;
  pageSize: number;
  setPageSize: (value: number) => void;
  page: number;
  setPage: (value: number) => void;
  pageSizeOptions?: number[];
  sx?: object;
}

/**
 * PaginationControl renders a pagination component with page size selection.
 * It allows users to navigate through pages and select the number of items per page.
 */
const PaginationControl: React.FC<PaginationProps> = ({
  totalItems,
  pageSize,
  setPageSize,
  page,
  setPage,
  pageSizeOptions = [5, 10, 20, 50],
  sx = {},
}) => (
  <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} sx={sx}>
    <TextField
      select
      label="Rows per page"
      size="small"
      sx={{ minWidth: 120, maxWidth: 120, mr: 2, '& .MuiFormLabel-root': { color: 'text.medium' } }}
      value={pageSize}
      onChange={(e) => {
        setPageSize(Number(e.target.value));
        setPage(1);
      }}
    >
      {pageSizeOptions.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
    <Pagination
      count={Math.ceil(totalItems / pageSize) || 1}
      page={page}
      onChange={(_, value) => setPage(value)}
      color="primary"
      shape="rounded"
      showFirstButton
      showLastButton
      sx={{ ml: 2 }}
    />
  </Box>
);

export default PaginationControl;
