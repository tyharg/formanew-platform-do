import React from 'react';
import Button from '@mui/material/Button';

/**
 * Stylized form button for submit actions.
 *
 * @param children - Button text or content.
 */
const FormButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Button type="submit" variant="contained" fullWidth size="large" sx={{ textTransform: 'none' }}>
    {children}
  </Button>
);

export default FormButton;
