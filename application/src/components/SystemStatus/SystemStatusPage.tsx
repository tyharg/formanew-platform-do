'use client';

import React, { useEffect, useState } from 'react';
import { Container, Typography, Alert, CircularProgress, Button, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import ConfigurableServiceCard from './ConfigurableServiceCard';
import { timeAgo } from '../../helpers/time';

interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  required: boolean;
  error?: string;
  configToReview?: string[];
}

interface SystemInfo {
  environment: string;
  timestamp: string;
  lastHealthCheck: string;
}

/**
 * Generic SystemStatusPage component for displaying the status of all configured services.
 * This component is service-agnostic and renders any services returned by the API.
 */
const SystemStatusPage: React.FC = () => {
  const router = useRouter();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = forceRefresh ? '/api/system-status?refresh=true' : '/api/system-status';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Status page received data:', data);
      setServices(data.services || []);
      setSystemInfo(data.systemInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching system status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const requiredServices = services.filter((service) => service.required);
  const optionalServices = services.filter((service) => !service.required);

  const hasRequiredIssues = requiredServices.some(
    (service) => !service.configured || !service.connected
  );
  const hasOptionalIssues = optionalServices.some(
    (service) => !service.configured || !service.connected
  );

  const getOverallStatusMessage = () => {
    // All services are working
    if (!hasRequiredIssues && !hasOptionalIssues) {
      return {
        title: 'All Services Operational',
        description: 'All systems are functioning normally.',
        severity: 'success' as const,
      };
    }

    // Critical service issues
    if (hasRequiredIssues) {
      return {
        title: 'Critical Service Issues',
        description: 'One or more required services have issues that need attention.',
        severity: 'error' as const,
      };
    }

    // Only optional service issues
    return {
      title: 'Optional Service Issues',
      description: 'Some optional features may be unavailable.',
      severity: 'warning' as const,
    };
  };

  const statusMessage = getOverallStatusMessage();
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {' '}
        <Stack alignItems="center" spacing={1}>
          <Typography variant="h3" component="h1">
            System Status
          </Typography>
          <Typography color="text.secondary">
            Service Configuration and Connectivity Status
          </Typography>
          {systemInfo?.lastHealthCheck && (
            <Typography variant="caption" color="text.secondary">
              Last checked: {timeAgo(new Date(systemInfo.lastHealthCheck))}
            </Typography>
          )}
        </Stack>
        {!loading && (
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => fetchStatus(true)}
              disabled={loading}
            >
              Refresh Status
            </Button>
            {!hasRequiredIssues && (
              <Button 
                variant="outlined" 
                startIcon={<HomeIcon />} 
                onClick={() => router.push('/')}
                disabled={loading}
              >
                Return Home
              </Button>
            )}
          </Stack>
        )}
        {loading ? (
          <Stack alignItems="center">
            <CircularProgress />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Stack spacing={3}>
            <Alert
              severity={statusMessage.severity}
              icon={statusMessage.severity === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
            >
              <Typography variant="h6">{statusMessage.title}</Typography>
              <Typography variant="body2">{statusMessage.description}</Typography>
            </Alert>

            {/* Service Status Cards */}
            <Stack spacing={2}>
              {services.map((service, index) => (
                <ConfigurableServiceCard key={`${service.name}-${index}`} service={service} />
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default SystemStatusPage;
