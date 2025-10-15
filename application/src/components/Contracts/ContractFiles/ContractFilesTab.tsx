'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { FilesApiClient, FileRecord } from '@/lib/api/files';

interface ContractFilesTabProps {
  contractId: string;
}

const filesClient = new FilesApiClient();
const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

const formatBytes = (value: number | null) => {
  if (value === null || value === undefined) {
    return 'Unknown size';
  }

  if (value === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(value) / Math.log(1024));
  const size = value / Math.pow(1024, index);
  return `${size.toFixed(size < 10 && index > 0 ? 1 : 0)} ${units[index]}`;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const formatDate = (value: string) => dateFormatter.format(new Date(value));

const ContractFilesTab: React.FC<ContractFilesTabProps> = ({ contractId }) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await filesClient.list(contractId);
      setFiles(items);
    } catch (err) {
      console.error('Failed to load files', err);
      setError('Unable to load files for this contract.');
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const sortedFiles = useMemo(
    () => files.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [files]
  );

  const getPreviewType = useCallback((file: FileRecord): 'image' | 'pdf' | null => {
    const mimeType = file.contentType?.toLowerCase() ?? '';
    const fileName = file.name?.toLowerCase() ?? '';

    if (!file.downloadUrl) {
      return null;
    }

    if (mimeType.startsWith('image/')) {
      return 'image';
    }

    if (mimeType === 'application/pdf') {
      return 'pdf';
    }

    if (mimeType === '' && (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.gif'))) {
      return 'image';
    }

    if (mimeType === '' && fileName.endsWith('.pdf')) {
      return 'pdf';
    }

    return null;
  }, []);

  const handlePreviewFile = useCallback((file: FileRecord) => {
    setPreviewFile(file);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  const activePreviewType = previewFile ? getPreviewType(previewFile) : null;

  const handleUploadClick = () => {
    setUploadError(null);
    setUploadSuccess(null);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setUploadError('File must be 20MB or smaller.');
      setUploadSuccess(null);
      event.target.value = '';
      return;
    }
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      await filesClient.upload(contractId, file, { name: file.name });
      setUploadSuccess(`${file.name} uploaded successfully.`);
      await loadFiles();
    } catch (uploadErr) {
      console.error('Failed to upload file', uploadErr);
      setUploadError(uploadErr instanceof Error ? uploadErr.message : 'Unable to upload file right now.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteFile = useCallback(
    async (file: FileRecord) => {
      const shouldDelete = window.confirm(`Delete ${file.name}? This cannot be undone.`);
      if (!shouldDelete) {
        return;
      }

      setUploadError(null);
      setUploadSuccess(null);
      setDeletingFileId(file.id);

      try {
        await filesClient.delete(contractId, file.id);
        if (previewFile?.id === file.id) {
          setPreviewFile(null);
        }
        setUploadSuccess(`${file.name} deleted successfully.`);
        await loadFiles();
      } catch (deleteErr) {
        console.error('Failed to delete file', deleteErr);
        setUploadError(
          deleteErr instanceof Error ? deleteErr.message : 'Unable to delete file right now.'
        );
      } finally {
        setDeletingFileId(null);
      }
    },
    [contractId, loadFiles, previewFile]
  );

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      <input type="file" ref={fileInputRef} hidden onChange={handleFileSelected} aria-hidden="true" />

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
          <CloudUploadIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              Add supporting files
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload executed agreements, exhibits, or reference assets. Files are stored securely in DigitalOcean
              Spaces.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Maximum file size: 20 MB.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUploadClick}
                disabled={isUploading}
                startIcon={isUploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
              >
                {isUploading ? 'Uploading…' : 'Upload file'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => void loadFiles()}
                disabled={isLoading}
              >
                Refresh list
              </Button>
            </Stack>
            {uploadError && (
              <Alert sx={{ mt: 2 }} severity="error">
                {uploadError}
              </Alert>
            )}
            {uploadSuccess && (
              <Alert sx={{ mt: 2 }} severity="success">
                {uploadSuccess}
              </Alert>
            )}
          </Box>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Existing files</Typography>
            <Tooltip title="Refresh files">
              <span>
                <IconButton onClick={() => void loadFiles()} disabled={isLoading}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={32} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : sortedFiles.length === 0 ? (
            <Alert severity="info">No files have been attached to this contract yet.</Alert>
          ) : (
            <List sx={{ width: '100%' }}>
              {sortedFiles.map((file) => {
                const previewType = getPreviewType(file);

                return (
                  <ListItem key={file.id} disableGutters divider>
                    <InsertDriveFileIcon color="action" sx={{ mr: 2 }} />
                    <ListItemText
                      primary={
                        previewType ? (
                          <Link
                            component="button"
                            type="button"
                            variant="body1"
                            onClick={() => handlePreviewFile(file)}
                            underline="hover"
                            sx={{ color: 'primary.main', textAlign: 'left', p: 0, fontWeight: 500 }}
                          >
                            {file.name}
                          </Link>
                        ) : (
                          file.name
                        )
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.secondary">
                            Added {formatDate(file.createdAt)}
                          </Typography>
                          {file.contentType && (
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1.5 }}>
                              • {file.contentType}
                            </Typography>
                          )}
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1.5 }}>
                            • {formatBytes(file.size ?? null)}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {file.downloadUrl && (
                          <Tooltip title="Download">
                            <IconButton
                              component="a"
                              href={file.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              color="primary"
                              aria-label={`Download ${file.name}`}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteFile(file)}
                              disabled={deletingFileId === file.id}
                              aria-label={`Delete ${file.name}`}
                            >
                              {deletingFileId === file.id ? (
                                <CircularProgress size={18} color="inherit" />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Stack>
      </Paper>

      <Dialog open={Boolean(previewFile)} onClose={handleClosePreview} maxWidth="md" fullWidth>
        {previewFile && (
          <>
            <DialogTitle>{previewFile.name}</DialogTitle>
            <DialogContent dividers>
              {activePreviewType === 'image' && (
                <Box
                  component="img"
                  src={previewFile.downloadUrl ?? undefined}
                  alt={previewFile.name}
                  sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 1, objectFit: 'contain' }}
                />
              )}
              {activePreviewType === 'pdf' && (
                <Box
                  component="iframe"
                  src={previewFile.downloadUrl ?? undefined}
                  title={previewFile.name}
                  sx={{ width: '100%', height: '70vh', border: 0 }}
                />
              )}
              {!activePreviewType && (
                <Typography variant="body2" color="text.secondary">
                  Preview unavailable for this file type.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              {previewFile.downloadUrl && (
                <Button
                  component="a"
                  href={previewFile.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in new tab
                </Button>
              )}
              <Button onClick={handleClosePreview}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
};

export default ContractFilesTab;
