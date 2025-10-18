import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { DIMENSIONS } from 'constants/landing';

/**
 * Footer of the application.
 * Displays a minimal copyright notice.
 */
export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        py: DIMENSIONS.spacing.card,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 FormaNew. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
