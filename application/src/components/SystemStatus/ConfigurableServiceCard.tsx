import React from 'react';
import { Card, CardContent, Typography, Alert, Chip, Stack, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';

interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  required: boolean;
  error?: string;
  configToReview?: string[];
  description?: string;
}

interface ConfigurableServiceCardProps {
  service: ServiceStatus;
}

/**
 * Generic component for displaying the status of any configurable service.
 * This component is service-agnostic and renders based on the service status data.
 */
const ConfigurableServiceCard: React.FC<ConfigurableServiceCardProps> = ({ service }) => {
  const getConnectionIcon = () => {
    if (service.configured === false) {
      // Show help icon for connection when not configured
      return <HelpIcon color="disabled" />;
    }

    return service.connected ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />;
  };

  const getConnectionStatus = () => {
    if (service.configured === false) {
      return 'Not tested';
    }
    return service.connected ? 'Successful' : 'Failed';
  };

  const getErrorMessage = () => {
    if (!service.error || !service.configToReview) {
      return service.error;
    }

    if (service.configured === false) {
      return `Missing settings: ${service.configToReview.join(', ')}`;
    } else {
      return `${service.error}. Please review the following settings: ${service.configToReview.join(', ')}`;
    }
  };
  const getErrorSeverity = () => {
    // For non-required services, show warnings instead of errors
    return service.required ? 'error' : 'warning';
  };
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{service.name}</Typography>
            <Chip
              label={service.required ? 'Required' : 'Optional'}
              color={service.required ? 'primary' : 'default'}
              size="small"
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            {service.configured ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
            <Typography>Configuration: {service.configured ? 'Valid' : 'Invalid'}</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            {getConnectionIcon()}
            <Typography>Connection: {getConnectionStatus()}</Typography>
          </Stack>

          {service.error && (
            <Alert severity={getErrorSeverity()}>
              {getErrorMessage()}
              <Divider sx={{ marginY: 1 }} />
              {service.description}
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ConfigurableServiceCard;
