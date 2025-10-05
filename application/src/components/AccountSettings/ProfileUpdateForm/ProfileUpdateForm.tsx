'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  Alert,
  Stack,
  Avatar,
  TextField,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

interface ProfileFormData {
  name: string;
  email: string;
  profileImage: File | null;
}

interface AvatarPreviewProps {
  label: string;
  src?: string;
  fallback?: string;
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({ label, src, fallback }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
      {label}
    </Typography>
    <Avatar src={src} sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 } }}>
      {fallback}
    </Avatar>
  </Box>
);

/**
 * Component for updating user profile information including name and profile image.
 * Simplified UI with Material UI components and minimal custom styling.
 */
export default function ProfileUpdateForm() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    profileImage: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const session = useSession();
  const user = session.data?.user;

  useEffect(() => {
    if (isInitialized || !user) return;

    setFormData({
      name: user.name ?? '',
      email: user.email ?? '',
      profileImage: null,
    });
    setIsInitialized(true);
  }, [isInitialized, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  // Create preview URL for selected image
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.profileImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(formData.profileImage);
    setPreviewUrl(objectUrl);

    // Cleanup function to revoke object URL
    return () => URL.revokeObjectURL(objectUrl);
  }, [formData.profileImage]);
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      try {
        const formDataToSubmit = new FormData();

        if (formData.profileImage !== null) {
          formDataToSubmit.append('file', formData.profileImage);
        }

        if (formData.name) {
          formDataToSubmit.append('name', formData.name);
        }

        const response = await fetch('/api/profile', {
          method: 'PATCH',
          body: formDataToSubmit,
        });

        if (!response.ok) {
          const errorText = await response.text();
          const errorJson = JSON.parse(errorText);
          throw new Error((errorJson as { error: string }).error || 'Failed to update profile');
        }

        const json = await response.json();
        session.update({ user: { name: json.name, image: json.image } });
        setFormData((prev) => ({ ...prev, profileImage: null, name: json.name }));

        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError((error as Error).message || 'An error occurred while updating the profile.');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, session]
  );
  return (
    <Card sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Profile Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Update your account details
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Current Profile Image */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: { xs: 2, sm: 3 },
            }}
          >
            {' '}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2 },
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}
            >
              {/* Single Avatar that shows Current or Preview based on state */}
              <AvatarPreview
                label={previewUrl ? 'Preview' : 'Current'}
                src={previewUrl || user?.image || undefined}
                fallback={user?.name?.[0]?.toUpperCase()}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Profile Picture
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  mt: 1,
                }}
              >
                <Button
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={isLoading}
                  size="small"
                  data-testid="upload-image-button"
                >
                  {formData.profileImage ? 'Change' : 'Upload'}
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {formData.profileImage && (
                  <Button
                    color="secondary"
                    size="small"
                    disabled={isLoading}
                    startIcon={<DeleteIcon />}
                    onClick={() => setFormData((prev) => ({ ...prev, profileImage: null }))}
                    data-testid="remove-image-button"
                  >
                    Remove
                  </Button>
                )}
              </Box>
              {formData.profileImage && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    mt: 1,
                    wordBreak: 'break-all',
                  }}
                >
                  Selected: {formData.profileImage.name}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Form Fields */}
          <TextField
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading}
            label="Name"
            id="name"
            name="name"
            placeholder="Your name"
          />
          <TextField
            value={formData.email}
            onChange={handleInputChange}
            disabled={true}
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="Your email"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            sx={{ alignSelf: 'flex-start' }}
            data-testid="save-profile-button"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}
