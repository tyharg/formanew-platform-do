import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: 'success' | 'error' | 'info' | 'warning';
  autoHideDuration?: number;
  onClose: () => void;
}

/**
 * Toast component displays a message in a Snackbar with optional severity and auto-hide duration.
 */
const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity = 'info',
  autoHideDuration = 4000,
  onClose,
}) => (
  <Snackbar
    open={open}
    autoHideDuration={autoHideDuration}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  >
    <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);

export default Toast;
