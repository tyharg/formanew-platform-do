'use client';

import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip, Badge } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useRouter } from 'next/navigation';

interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  required: boolean;
  error?: string;
}

/**
 * Component that shows a warning indicator in the header when optional services have issues.
 * Only displays when there are optional service failures but no required service failures.
 */
const ServiceWarningIndicator: React.FC = () => {
  const [hasErrors, setHasErrors] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        const response = await fetch('/api/system-status');
        if (response.ok) {
          const data = await response.json();
          const services: ServiceStatus[] = data.services || [];
          const issues = services.filter((service) => !service.configured || !service.connected);
          setHasErrors(issues.length > 0);
          setErrorCount(issues.length);
        }
      } catch (error) {
        console.error('Failed to check service status:', error);
        setHasErrors(false);
      }
    };
    checkServiceStatus();
    const interval = setInterval(checkServiceStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    router.push('/system-status');
  };

  if (!hasErrors) {
    return null;
  }

  return (
    <Tooltip
      title={`${errorCount} optional service${errorCount !== 1 ? 's' : ''} have configuration issues. Click to view details.`}
      data-testid="ServiceWarningIndicator"
    >
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'warning.main',
          '&:hover': {
            backgroundColor: 'warning.light',
            color: 'warning.dark',
          },
        }}
      >
        <Badge badgeContent={errorCount} color="warning">
          <WarningIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default ServiceWarningIndicator;
