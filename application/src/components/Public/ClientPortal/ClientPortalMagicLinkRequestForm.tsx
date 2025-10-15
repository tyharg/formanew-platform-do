import React from 'react';
import { Box, Typography, TextField, Button, Container } from '@mui/material';

interface ClientPortalMagicLinkRequestFormProps {
  companyId: string;
}

const ClientPortalMagicLinkRequestForm: React.FC<ClientPortalMagicLinkRequestFormProps> = ({ companyId }) => {
  // Placeholder implementation for the magic link request form
  // In a real application, this would handle state, API calls, and validation.

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(`Requesting magic link for company: ${companyId}`);
    // Logic to send magic link request
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Client Portal Access
        </Typography>
        <Typography variant="body1" gutterBottom>
          Enter your email address associated with this company's client portal to receive a secure access link.
        </Typography>
        <TextField
          label="Email Address"
          type="email"
          required
          fullWidth
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Send Access Link
        </Button>
        <Typography variant="caption" color="text.secondary">
          Company ID: {companyId}
        </Typography>
      </Box>
    </Container>
  );
};

export default ClientPortalMagicLinkRequestForm;
