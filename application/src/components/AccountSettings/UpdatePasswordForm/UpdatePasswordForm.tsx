import React, { useState } from 'react';
import { Button, Card, Typography, Stack, Alert, CircularProgress, TextField } from '@mui/material';

/**
 * Form for updating user password.
 *
 * Has three fields, current password, new password and confirm new password.
 */
export const UpdatePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      formData.append('confirmNewPassword', confirmNewPassword);

      const response = await fetch('/api/password', {
        method: 'PATCH',
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Error ${response.status}: ${data.error || 'Failed to update password.'}`);
      }
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Change Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ensure your account is secure
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <Stack spacing={3}>
        <TextField
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          label="Current Password"
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="Current password"
          required={true}
          data-testid="current-password-input"
        />
        <TextField
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          label="New Password"
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="New password"
          required={true}
          data-testid="new-password-input"
        />
        <TextField
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          label="Confirm New Password"
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          placeholder="Confirm new password"
          required={true}
          data-testid="confirm-password-input"
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
          sx={{ alignSelf: 'flex-start' }}
          data-testid="update-password-button"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </Stack>
    </Card>
  );
};

export default UpdatePasswordForm;
