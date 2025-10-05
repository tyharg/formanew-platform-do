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
 * - Consistent max width and centering
 * - Standard horizontal and vertical padding
 * - Optional page title rendering
 * - Customizable max width
 * - Option to disable padding for full-width content
 * - Supports all Box props for additional customization
 *
 * @param children - Content to be rendered inside the container
 * @param maxWidth - Maximum width of the container (default: 1200)
 * @param disablePadding - Whether to disable the default padding
 * @param title - Optional page title to display at the top
 * @param sx - Additional styling
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 1200,
  disablePadding = false,
  title,
  sx = {},
  ...boxProps
}) => {
  return (
    <Box
      sx={{
        maxWidth,
        mx: 'auto',
        ...(!disablePadding && {
          px: 2,
          py: 4,
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
      <Card sx={{ p: 4 }}>{children}</Card>
    </Box>
  );
};

export default PageContainer;
