import React from 'react';
import { Box, BoxProps, Typography, Card } from '@mui/material';

interface PageContainerProps extends Omit<BoxProps, 'sx'> {
  children: React.ReactNode;
  maxWidth?: number | string;
  disablePadding?: boolean;
  title?: string;
  sx?: BoxProps['sx'];
}

/**
 * Reusable page container component that provides consistent layout and spacing.
 *
 * Features:
 * - Consistent centering with optional max width override
 * - Standard horizontal and vertical padding
 * - Optional page title rendering
 * - Customizable max width
 * - Option to disable padding for full-width content
 * - Supports all Box props for additional customization
 *
 * @param children - Content to be rendered inside the container
 * @param maxWidth - Optional maximum width of the container
 * @param disablePadding - Whether to disable the default padding
 * @param title - Optional page title to display at the top
 * @param sx - Additional styling
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth,
  disablePadding = false,
  title,
  sx = {},
  ...boxProps
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        ...(maxWidth && { maxWidth }),
        mx: 'auto',
        ...(!disablePadding && {
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
          py: { xs: 2, md: 4, lg: 5 },
        }),
        ...sx,
      }}
      {...boxProps}
    >
      {title && (
        <Typography variant="h4" component="h1" fontWeight="bold" mb={4}>
          {title}
        </Typography>
      )}
      <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>{children}</Card>
    </Box>
  );
};

export default PageContainer;
